import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, TicketStatus } from '@prisma/client';

type DateRange = {
  start: Date;
  endExclusive: Date;
};

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(from: string, to: string) {
    const { start, endExclusive } = this.buildDateRange(from, to);

    const [paidAgg, canceledCount, salesByDay] = await Promise.all([
      this.prisma.ticket.aggregate({
        where: {
          status: TicketStatus.PAID,
          updatedAt: { gte: start, lt: endExclusive },
        },
        _sum: { total: true },
        _count: { _all: true },
      }),
      this.prisma.ticket.count({
        where: {
          status: TicketStatus.CANCELED,
          updatedAt: { gte: start, lt: endExclusive },
        },
      }),
      this.prisma.$queryRaw<
        Array<{
          day: Date;
          totalSales: Prisma.Decimal;
          ticketsCount: number;
        }>
      >`
        SELECT
          DATE_TRUNC('day', t."updatedAt")::date AS day,
          COALESCE(SUM(t."total"), 0) AS "totalSales",
          COUNT(*)::int AS "ticketsCount"
        FROM "tickets" t
        WHERE t."status" = 'PAID'
          AND t."updatedAt" >= ${start}
          AND t."updatedAt" < ${endExclusive}
        GROUP BY day
        ORDER BY day ASC
      `,
    ]);

    const totalSales = paidAgg._sum.total ?? new Prisma.Decimal(0);
    const paidTicketsCount = paidAgg._count._all;
    const canceledTicketsCount = canceledCount;
    const ticketsCount = paidTicketsCount + canceledTicketsCount;
    const avgTicket =
      paidTicketsCount > 0 ? totalSales.div(paidTicketsCount).toNumber() : 0;

    return {
      totalSales: totalSales.toNumber(),
      ticketsCount,
      avgTicket,
      paidTicketsCount,
      canceledTicketsCount,
      salesByDay: salesByDay.map((row) => ({
        day: row.day.toISOString().slice(0, 10),
        totalSales: row.totalSales.toNumber(),
        ticketsCount: row.ticketsCount,
      })),
    };
  }

  async getTopProducts(from: string, to: string, limit = 10) {
    const { start, endExclusive } = this.buildDateRange(from, to);

    const rows = await this.prisma.ticketItem.groupBy({
      by: ['productId', 'productNameSnapshot'],
      where: {
        ticket: {
          status: TicketStatus.PAID,
          updatedAt: { gte: start, lt: endExclusive },
        },
      },
      _sum: {
        qty: true,
        lineTotalSnapshot: true,
      },
      orderBy: {
        _sum: { lineTotalSnapshot: 'desc' },
      },
      take: limit,
    });

    return rows.map((row) => ({
      productId: row.productId,
      productName: row.productNameSnapshot,
      qtySold: row._sum.qty ?? 0,
      grossSales: row._sum.lineTotalSnapshot
        ? row._sum.lineTotalSnapshot.toNumber()
        : 0,
    }));
  }

  async getPaymentsBreakdown(from: string, to: string) {
    const { start, endExclusive } = this.buildDateRange(from, to);

    const rows = await this.prisma.payment.groupBy({
      by: ['method'],
      where: {
        ticket: {
          status: TicketStatus.PAID,
          updatedAt: { gte: start, lt: endExclusive },
        },
      },
      _sum: { amount: true },
      _count: { _all: true },
      orderBy: { method: 'asc' },
    });

    return rows.map((row) => ({
      method: row.method,
      totalAmount: row._sum.amount ? row._sum.amount.toNumber() : 0,
      count: row._count._all,
    }));
  }

  async getSalesByHour(from: string, to: string, tz = 'UTC') {
    const { start, endExclusive } = this.buildDateRange(from, to);

    const rows = await this.prisma.$queryRaw<
      Array<{
        hour: number;
        totalSales: Prisma.Decimal;
        ticketsCount: number;
      }>
    >`
      SELECT
        EXTRACT(HOUR FROM (t."updatedAt" AT TIME ZONE ${tz}))::int AS hour,
        COALESCE(SUM(t."total"), 0) AS "totalSales",
        COUNT(*)::int AS "ticketsCount"
      FROM "tickets" t
      WHERE t."status" = 'PAID'
        AND t."updatedAt" >= ${start}
        AND t."updatedAt" < ${endExclusive}
      GROUP BY hour
      ORDER BY hour ASC
    `;

    return {
      timezone: tz,
      hours: rows.map((row) => ({
        hour: row.hour,
        totalSales: row.totalSales.toNumber(),
        ticketsCount: row.ticketsCount,
      })),
    };
  }

  private buildDateRange(from: string, to: string): DateRange {
    const start = new Date(`${from}T00:00:00.000Z`);
    const end = new Date(`${to}T00:00:00.000Z`);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new BadRequestException('from/to inválidos.');
    }
    if (end < start) {
      throw new BadRequestException('to no puede ser menor que from.');
    }

    const endExclusive = new Date(end.getTime() + 24 * 60 * 60 * 1000);
    return { start, endExclusive };
  }
}

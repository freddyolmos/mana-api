import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  OrderItemStatus,
  OrderStatus,
  Prisma,
  TicketStatus,
} from '@prisma/client';

@Injectable()
export class TicketsService {
  constructor(private readonly prisma: PrismaService) {}

  async createFromOrder(orderId: number) {
    const existing = await this.prisma.ticket.findUnique({
      where: { orderId },
    });
    if (existing) {
      throw new ConflictException('Ticket ya existe para esta orden.');
    }

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          orderBy: { id: 'asc' },
          include: {
            product: true,
            modifiers: { include: { group: true, option: true } },
          },
        },
      },
    });
    if (!order) throw new NotFoundException('Orden no encontrada.');

    if (
      order.status !== OrderStatus.SENT_TO_KITCHEN &&
      order.status !== OrderStatus.READY
    ) {
      throw new BadRequestException('La orden no está lista para ticket.');
    }

    const hasPending = order.items.some(
      (item) =>
        item.status === OrderItemStatus.PENDING ||
        item.status === OrderItemStatus.IN_PROGRESS,
    );
    if (hasPending) {
      throw new BadRequestException(
        'No puedes generar ticket: hay items pendientes.',
      );
    }
    if (order.items.length === 0) {
      throw new BadRequestException('La orden no tiene items.');
    }

    const itemsData = order.items.map((item) => ({
      productId: item.productId,
      productNameSnapshot: item.product.name,
      qty: item.qty,
      unitPriceSnapshot: item.unitPrice,
      modifiersSnapshot: item.modifiers.map((modifier) => ({
        groupId: modifier.groupId,
        groupName: modifier.group.name,
        optionId: modifier.optionId,
        optionName: modifier.option.name,
        priceDelta: Number(modifier.priceDeltaSnapshot),
      })),
      modifiersTotalSnapshot: item.modifiersTotal,
      lineTotalSnapshot: item.lineTotal,
    }));

    return this.prisma.ticket.create({
      data: {
        orderId: order.id,
        subtotal: order.subtotal,
        total: order.total,
        items: { create: itemsData },
      },
      include: { items: true },
    });
  }

  async getById(id: number) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!ticket) throw new NotFoundException('Ticket no encontrado.');
    return ticket;
  }

  async cancel(id: number) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!ticket) throw new NotFoundException('Ticket no encontrado.');
    if (ticket.status === TicketStatus.PAID) {
      throw new BadRequestException('No puedes cancelar un ticket pagado.');
    }
    if (ticket.status === TicketStatus.CANCELED) return ticket;

    return this.prisma.ticket.update({
      where: { id },
      data: { status: TicketStatus.CANCELED },
      include: { items: true },
    });
  }

  async close(id: number) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
    });
    if (!ticket) throw new NotFoundException('Ticket no encontrado.');
    if (ticket.status === TicketStatus.CANCELED) {
      throw new BadRequestException('No puedes cerrar un ticket cancelado.');
    }
    if (ticket.status === TicketStatus.PAID) return ticket;

    const paidAgg = await this.prisma.payment.aggregate({
      where: { ticketId: id },
      _sum: { amount: true },
    });
    const paid = paidAgg._sum.amount ?? new Prisma.Decimal(0);
    if (paid.lt(ticket.total)) {
      throw new BadRequestException(
        'Pagos insuficientes para cerrar el ticket.',
      );
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedTicket = await tx.ticket.update({
        where: { id },
        data: { status: TicketStatus.PAID },
        include: { items: true },
      });
      await tx.order.update({
        where: { id: ticket.orderId },
        data: { status: OrderStatus.CLOSED },
      });
      return updatedTicket;
    });

    return updated;
  }
}

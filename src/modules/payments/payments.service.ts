import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentMethod, Prisma, TicketStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePaymentDto, userId?: number) {
    return this.prisma.$transaction(async (tx) => {
      const ticket = await tx.ticket.findUnique({
        where: { id: dto.ticketId },
        select: { id: true, status: true, total: true, orderId: true },
      });
      if (!ticket) throw new NotFoundException('Ticket no encontrado.');
      if (ticket.status !== TicketStatus.OPEN) {
        throw new BadRequestException('El ticket no está abierto para pagos.');
      }

      const paidAgg = await tx.payment.aggregate({
        where: { ticketId: dto.ticketId },
        _sum: { amount: true },
      });
      const paid = paidAgg._sum.amount ?? new Prisma.Decimal(0);
      const amount = new Prisma.Decimal(dto.amount);
      const newTotal = paid.add(amount);

      let change = new Prisma.Decimal(0);
      if (dto.method === PaymentMethod.CASH && newTotal.gt(ticket.total)) {
        change = newTotal.sub(ticket.total);
      }

      const payment = await tx.payment.create({
        data: {
          ticketId: dto.ticketId,
          createdById: userId ?? null,
          method: dto.method,
          amount,
          change,
        },
      });

      await tx.orderEvent.create({
        data: {
          orderId: ticket.orderId,
          type: 'PAYMENT_ADDED',
          createdById: userId ?? null,
          payload: {
            ticketId: dto.ticketId,
            paymentId: payment.id,
            method: dto.method,
            amount: Number(dto.amount),
            change: change.toNumber(),
          },
        },
      });

      return payment;
    });
  }
}

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

  async create(dto: CreatePaymentDto) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: dto.ticketId },
      select: { id: true, status: true, total: true },
    });
    if (!ticket) throw new NotFoundException('Ticket no encontrado.');
    if (ticket.status !== TicketStatus.OPEN) {
      throw new BadRequestException('El ticket no está abierto para pagos.');
    }

    const paidAgg = await this.prisma.payment.aggregate({
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

    return this.prisma.payment.create({
      data: {
        ticketId: dto.ticketId,
        method: dto.method,
        amount,
        change,
      },
    });
  }
}

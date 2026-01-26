import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateOrderDto, createdById?: number) {
    return this.prisma.order.create({
      data: {
        type: dto.type,
        notes: dto.notes?.trim(),
        createdById: createdById ?? null,
      },
    });
  }
}

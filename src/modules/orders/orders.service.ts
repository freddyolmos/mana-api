import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AddOrderItemDto } from './dto/add-order-item.dto';
import { OrderStatus, Prisma } from '@prisma/client';
import { OrderResponseDto } from './dto/order-response.dto';
import { OrderItemResponseDto } from './dto/order-item-response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  private toOrderResponse(order: unknown) {
    return plainToInstance(OrderResponseDto, order);
  }

  private toOrderItemResponse(item: unknown) {
    return plainToInstance(OrderItemResponseDto, item);
  }

  async create(dto: CreateOrderDto, createdById?: number) {
    const order = await this.prisma.order.create({
      data: {
        type: dto.type,
        notes: dto.notes?.trim(),
        createdById: createdById ?? null,
      },
    });
    return this.toOrderResponse(order);
  }

  async getById(orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          orderBy: { id: 'asc' },
          include: {
            product: true,
            modifiers: {
              include: { group: true, option: true },
            },
          },
        },
      },
    });
    if (!order) throw new NotFoundException('Orden no encontrada.');
    return this.toOrderResponse(order);
  }

  async addItem(orderId: number, dto: AddOrderItemDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, status: true },
    });
    if (!order) throw new NotFoundException('Orden no encontrada.');
    if (order.status !== OrderStatus.OPEN) {
      throw new BadRequestException(
        'Solo se pueden editar órdenes en estado OPEN.',
      );
    }

    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
      select: { id: true, price: true, isActive: true },
    });
    if (!product || !product.isActive)
      throw new BadRequestException('Producto inválido o inactivo.');

    const modifiers = dto.modifiers ?? [];
    const sentGroupIds = modifiers.map((m) => m.groupId);

    const assigned = await this.prisma.productModifierGroup.findMany({
      where: { productId: dto.productId },
      select: { groupId: true },
    });
    const assignedGroupIds = assigned.map((a) => a.groupId);
    const assignedSet = new Set(assignedGroupIds);

    // B) Verificar que los grupos enviados sí estén asignados al producto
    const notAssigned = sentGroupIds.filter((gid) => !assignedSet.has(gid));
    if (notAssigned.length) {
      throw new BadRequestException(
        `Hay grupos no asignados al producto: ${notAssigned.join(', ')}`,
      );
    }

    const groups = assignedGroupIds.length
      ? await this.prisma.modifierGroup.findMany({
          where: { id: { in: assignedGroupIds }, isActive: true },
          include: { options: { where: { isActive: true } } },
        })
      : [];

    const groupMap = new Map(groups.map((g) => [g.id, g]));

    const sentSet = new Set(sentGroupIds);
    const requiredMissing = groups
      .filter((g) => g.required)
      .filter((g) => !sentSet.has(g.id));

    if (requiredMissing.length) {
      const names = requiredMissing.map((g) => g.name).join(', ');
      throw new BadRequestException(`Faltan grupos requeridos: ${names}`);
    }

    let modifiersTotal = new Prisma.Decimal(0);
    const modifierRows: Array<{
      groupId: number;
      optionId: number;
      priceDeltaSnapshot: Prisma.Decimal;
    }> = [];

    for (const sel of modifiers) {
      const group = groupMap.get(sel.groupId);
      if (!group)
        throw new BadRequestException(
          `Grupo inválido/inactivo: ${sel.groupId}`,
        );

      const optionIdsUnique = Array.from(new Set(sel.optionIds));
      if (!group.multi && optionIdsUnique.length > 1) {
        throw new BadRequestException(
          `El grupo ${group.name} no permite múltiples opciones.`,
        );
      }
      if (optionIdsUnique.length < group.minSelect) {
        throw new BadRequestException(
          `El grupo ${group.name} requiere mínimo ${group.minSelect}.`,
        );
      }
      if (optionIdsUnique.length > group.maxSelect) {
        throw new BadRequestException(
          `El grupo ${group.name} permite máximo ${group.maxSelect}.`,
        );
      }

      const validOptionSet = new Set(group.options.map((o) => o.id));
      for (const optionId of optionIdsUnique) {
        if (!validOptionSet.has(optionId)) {
          throw new BadRequestException(
            `La opción ${optionId} no pertenece al grupo ${group.name}.`,
          );
        }
        const option = group.options.find((o) => o.id === optionId)!;

        const delta = option.priceDelta;
        modifiersTotal = modifiersTotal.add(delta);

        modifierRows.push({
          groupId: group.id,
          optionId: option.id,
          priceDeltaSnapshot: delta,
        });
      }
    }

    const unitPrice = product.price;
    const lineTotal = unitPrice.add(modifiersTotal).mul(dto.qty);

    const result = await this.prisma.$transaction(async (tx) => {
      const item = await tx.orderItem.create({
        data: {
          orderId,
          productId: dto.productId,
          qty: dto.qty,
          notes: dto.notes?.trim(),
          unitPrice,
          modifiersTotal,
          lineTotal,
          modifiers: {
            create: modifierRows,
          },
        },
        include: {
          product: true,
          modifiers: {
            include: { group: true, option: true },
          },
        },
      });

      const totals = await tx.orderItem.aggregate({
        where: { orderId },
        _sum: { lineTotal: true },
      });

      const newTotal = totals._sum.lineTotal ?? new Prisma.Decimal(0);

      await tx.order.update({
        where: { id: orderId },
        data: { subtotal: newTotal, total: newTotal },
      });

      return item;
    });

    return this.toOrderItemResponse(result);
  }

  async removeItem(orderId: number, itemId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, status: true },
    });
    if (!order) throw new NotFoundException('Orden no encontrada.');
    if (order.status !== OrderStatus.OPEN) {
      throw new BadRequestException(
        'Solo se pueden editar órdenes en estado OPEN.',
      );
    }

    await this.prisma.$transaction(async (tx) => {
      const item = await tx.orderItem.findUnique({
        where: { id: itemId },
        select: { id: true, orderId: true },
      });
      if (!item || item.orderId !== orderId)
        throw new NotFoundException('Item no encontrado en esta orden.');

      await tx.orderItem.delete({ where: { id: itemId } });

      const totals = await tx.orderItem.aggregate({
        where: { orderId },
        _sum: { lineTotal: true },
      });

      const newTotal = totals._sum.lineTotal ?? new Prisma.Decimal(0);
      await tx.order.update({
        where: { id: orderId },
        data: { subtotal: newTotal, total: newTotal },
      });
    });

    return { ok: true };
  }

  async sendToKitchen(orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new NotFoundException('Orden no encontrada.');
    if (order.status !== OrderStatus.OPEN) {
      throw new BadRequestException(
        'Solo puedes enviar a cocina una orden OPEN.',
      );
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.SENT_TO_KITCHEN },
    });
    return this.toOrderResponse(updated);
  }
}

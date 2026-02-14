import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderItemStatus, OrderStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { QueryKitchenOrdersDto } from './dto/query-kitchen-orders.dto';
import { UpdateKitchenItemDto } from './dto/update-kitchen-item.dto';
import { KitchenGateway } from './kitchen.gateway';

const allowedTransitions: Record<OrderItemStatus, OrderItemStatus[]> = {
  PENDING: [OrderItemStatus.IN_PROGRESS],
  IN_PROGRESS: [OrderItemStatus.READY],
  READY: [],
  CANCELED: [],
};

@Injectable()
export class KitchenService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly kitchenGateway: KitchenGateway,
  ) {}

  async listKitchenOrders(query: QueryKitchenOrdersDto) {
    const status = query.status ?? OrderStatus.SENT_TO_KITCHEN;
    return this.prisma.order.findMany({
      where: { status },
      orderBy: { id: 'asc' },
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
  }

  async getKitchenOrder(orderId: number) {
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
    if (order.status !== OrderStatus.SENT_TO_KITCHEN) {
      throw new BadRequestException('La orden no está en cocina.');
    }
    return order;
  }

  async updateKitchenItemStatus(
    orderId: number,
    itemId: number,
    dto: UpdateKitchenItemDto,
    userId?: number,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, status: true },
    });
    if (!order) throw new NotFoundException('Orden no encontrada.');
    if (order.status !== OrderStatus.SENT_TO_KITCHEN) {
      throw new BadRequestException('La orden no está en cocina.');
    }

    const item = await this.prisma.orderItem.findUnique({
      where: { id: itemId },
      select: { id: true, orderId: true, status: true },
    });
    if (!item || item.orderId !== orderId) {
      throw new NotFoundException('Item no encontrado en esta orden.');
    }

    const allowed = allowedTransitions[item.status] ?? [];
    if (!allowed.includes(dto.status)) {
      throw new BadRequestException(
        `Transición inválida: ${item.status} -> ${dto.status}`,
      );
    }

    const prevStatus = item.status;
    const { updatedItem, orderReady } = await this.prisma.$transaction(
      async (tx) => {
        const updatedItem = await tx.orderItem.update({
          where: { id: itemId },
          data: { status: dto.status },
          include: {
            product: true,
            modifiers: { include: { group: true, option: true } },
          },
        });

        await tx.orderEvent.create({
          data: {
            orderId,
            type: 'ITEM_STATUS_CHANGED',
            createdById: userId ?? null,
            payload: {
              itemId,
              from: prevStatus,
              to: dto.status,
            },
          },
        });

        let orderReady = false;
        if (dto.status === OrderItemStatus.READY) {
          const pendingCount = await tx.orderItem.count({
            where: {
              orderId,
              status: {
                in: [OrderItemStatus.PENDING, OrderItemStatus.IN_PROGRESS],
              },
            },
          });
          if (pendingCount === 0) {
            await tx.order.update({
              where: { id: orderId },
              data: { status: OrderStatus.READY },
            });
            await tx.orderEvent.create({
              data: {
                orderId,
                type: 'ORDER_READY',
                createdById: userId ?? null,
              },
            });
            orderReady = true;
          }
        }

        return { updatedItem, orderReady };
      },
    );

    this.kitchenGateway.broadcastItemUpdated({
      orderId,
      item: updatedItem,
    });

    if (orderReady) {
      this.kitchenGateway.broadcastOrderReady({
        orderId,
        status: OrderStatus.READY,
      });
    }

    return updatedItem;
  }

  broadcastOrderSent(payload: unknown) {
    this.kitchenGateway.broadcastOrderSent(payload);
  }

  broadcastOrderReady(payload: unknown) {
    this.kitchenGateway.broadcastOrderReady(payload);
  }
}

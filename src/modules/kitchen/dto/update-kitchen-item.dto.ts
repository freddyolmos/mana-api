import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { OrderItemStatus } from '@prisma/client';

export class UpdateKitchenItemDto {
  @ApiProperty({ enum: OrderItemStatus })
  @IsEnum(OrderItemStatus)
  status!: OrderItemStatus;
}

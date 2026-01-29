import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { OrderItemStatus } from '@prisma/client';
import { OrderProductResponseDto } from './order-product-response.dto';
import { OrderItemModifierResponseDto } from './order-item-modifier-response.dto';

export class OrderItemResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  orderId: number;

  @ApiProperty()
  productId: number;

  @ApiProperty()
  qty: number;

  @ApiProperty({ enum: OrderItemStatus })
  status: OrderItemStatus;

  @ApiPropertyOptional()
  notes?: string | null;

  @ApiProperty()
  unitPrice: number;

  @ApiProperty()
  modifiersTotal: number;

  @ApiProperty()
  lineTotal: number;

  @ApiProperty({ type: OrderProductResponseDto })
  @Type(() => OrderProductResponseDto)
  product: OrderProductResponseDto;

  @ApiProperty({ type: OrderItemModifierResponseDto, isArray: true })
  @Type(() => OrderItemModifierResponseDto)
  modifiers: OrderItemModifierResponseDto[];

  @ApiProperty({ example: '2026-01-27T18:30:00.000Z' })
  @Transform(({ value }: { value: Date | string }) =>
    value instanceof Date ? value.toISOString() : value,
  )
  createdAt: string;

  @ApiProperty({ example: '2026-01-27T18:30:00.000Z' })
  @Transform(({ value }: { value: Date | string }) =>
    value instanceof Date ? value.toISOString() : value,
  )
  updatedAt: string;
}

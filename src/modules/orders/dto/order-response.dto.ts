import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { OrderStatus, OrderType } from '@prisma/client';
import { OrderItemResponseDto } from './order-item-response.dto';

export class OrderResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ enum: OrderType })
  type: OrderType;

  @ApiProperty({ enum: OrderStatus })
  status: OrderStatus;

  @ApiPropertyOptional()
  notes?: string | null;

  @ApiProperty()
  subtotal: number;

  @ApiProperty()
  total: number;

  @ApiPropertyOptional()
  createdById?: number | null;

  @ApiPropertyOptional({ type: OrderItemResponseDto, isArray: true })
  @Type(() => OrderItemResponseDto)
  items?: OrderItemResponseDto[];

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

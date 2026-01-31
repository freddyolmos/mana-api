import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class TicketItemResponseDto {
  @ApiProperty()
  id: number;

  @ApiPropertyOptional()
  productId?: number | null;

  @ApiProperty()
  productNameSnapshot: string;

  @ApiProperty()
  qty: number;

  @ApiProperty()
  unitPriceSnapshot: number;

  @ApiPropertyOptional()
  modifiersSnapshot?: unknown;

  @ApiProperty()
  modifiersTotalSnapshot: number;

  @ApiProperty()
  lineTotalSnapshot: number;

  @ApiProperty({ example: '2026-01-27T18:30:00.000Z' })
  @Transform(({ value }: { value: Date | string }) =>
    value instanceof Date ? value.toISOString() : value,
  )
  createdAt: string;
}

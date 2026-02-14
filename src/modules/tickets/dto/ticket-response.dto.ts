import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { TicketStatus } from '@prisma/client';
import { TicketItemResponseDto } from './ticket-item-response.dto';

export class TicketResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  orderId: number;

  @ApiPropertyOptional()
  createdById?: number | null;

  @ApiProperty({ enum: TicketStatus })
  status: TicketStatus;

  @ApiProperty()
  subtotal: number;

  @ApiProperty()
  total: number;

  @ApiPropertyOptional({ type: TicketItemResponseDto, isArray: true })
  @Type(() => TicketItemResponseDto)
  items?: TicketItemResponseDto[];

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

import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { PaymentMethod } from '@prisma/client';

export class PaymentResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  ticketId: number;

  @ApiProperty()
  createdById: number | null;

  @ApiProperty({ enum: PaymentMethod })
  method: PaymentMethod;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  change: number;

  @ApiProperty({ example: '2026-01-27T18:30:00.000Z' })
  @Transform(({ value }: { value: Date | string }) =>
    value instanceof Date ? value.toISOString() : value,
  )
  createdAt: string;
}

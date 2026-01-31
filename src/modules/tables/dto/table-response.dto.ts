import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { TableStatus } from '@prisma/client';

export class TableResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: TableStatus })
  status: TableStatus;

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

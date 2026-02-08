import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class ReportRangeQueryDto {
  @ApiProperty({ example: '2026-02-01' })
  @IsDateString()
  from!: string;

  @ApiProperty({ example: '2026-02-03' })
  @IsDateString()
  to!: string;
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { ReportRangeQueryDto } from './report-range-query.dto';

export class SalesByHourQueryDto extends ReportRangeQueryDto {
  @ApiPropertyOptional({
    example: 'America/Mexico_City',
    default: 'UTC',
  })
  @IsOptional()
  @IsString()
  tz?: string;
}

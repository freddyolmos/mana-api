import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateTableDto {
  @ApiPropertyOptional({ example: 'M2' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  name?: string;
}

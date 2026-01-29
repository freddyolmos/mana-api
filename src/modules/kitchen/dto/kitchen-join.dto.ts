import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class KitchenJoinDto {
  @ApiPropertyOptional({ example: 'kitchen' })
  @IsOptional()
  @IsString()
  room?: string;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export enum OrderTypeDto {
  DINE_IN = 'DINE_IN',
  TAKEOUT = 'TAKEOUT',
  DELIVERY = 'DELIVERY',
}

export class CreateOrderDto {
  @ApiProperty({ enum: OrderTypeDto, example: OrderTypeDto.TAKEOUT })
  @IsEnum(OrderTypeDto)
  type!: OrderTypeDto;

  @ApiPropertyOptional({ example: 'Sin cebolla' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

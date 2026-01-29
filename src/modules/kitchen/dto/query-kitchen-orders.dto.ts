import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { OrderStatus } from '@prisma/client';

export class QueryKitchenOrdersDto {
  @ApiPropertyOptional({
    enum: OrderStatus,
    default: OrderStatus.SENT_TO_KITCHEN,
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}

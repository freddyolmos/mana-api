import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNumber, Min } from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class CreatePaymentDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  ticketId!: number;

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  method!: PaymentMethod;

  @ApiProperty({ example: 200 })
  @IsNumber()
  @Min(0.01)
  amount!: number;
}

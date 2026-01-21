import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateModifierOptionDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  groupId!: number;

  @ApiProperty({ example: 'BBQ' })
  @IsString()
  @MaxLength(80)
  name!: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Min(0)
  priceDelta?: number;
}

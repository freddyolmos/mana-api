import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Bebidas' })
  @IsString()
  @MaxLength(80)
  name!: string;

  @ApiProperty({ example: 0, required: false, description: 'Orden en el menú' })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateProductDto {
  @ApiPropertyOptional({ example: 'Enchiladas verdes' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @ApiPropertyOptional({
    example: 'Enchiladas con salsa verde, queso y crema.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    example: 'https://www.mana.com/enchiladas-verdes.jpg',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string;

  @ApiPropertyOptional({ example: 100.0 })
  @IsOptional()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ example: 1, description: 'ID de la categoría' })
  @IsOptional()
  @IsInt()
  @Min(1)
  categoryId?: number;

  @ApiPropertyOptional({ example: true, description: 'Estado del producto' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

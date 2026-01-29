import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CatalogBaseResponseDto } from '../../dto/catalog-base-response.dto';
import { CategoryResponseDto } from '../../categories/dto/category-response.dto';

export class ProductResponseDto extends CatalogBaseResponseDto {
  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string | null;

  @ApiPropertyOptional()
  imageUrl?: string | null;

  @ApiProperty()
  price: number;

  @ApiProperty()
  categoryId: number;

  @ApiProperty({ type: CategoryResponseDto })
  @Type(() => CategoryResponseDto)
  category: CategoryResponseDto;
}

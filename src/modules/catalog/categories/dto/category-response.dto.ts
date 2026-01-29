import { ApiProperty } from '@nestjs/swagger';
import { CatalogBaseResponseDto } from '../../dto/catalog-base-response.dto';

export class CategoryResponseDto extends CatalogBaseResponseDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  sortOrder: number;
}

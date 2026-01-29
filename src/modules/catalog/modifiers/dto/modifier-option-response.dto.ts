import { ApiProperty } from '@nestjs/swagger';
import { CatalogBaseResponseDto } from '../../dto/catalog-base-response.dto';

export class ModifierOptionResponseDto extends CatalogBaseResponseDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  priceDelta: number;

  @ApiProperty()
  groupId: number;
}

import { ApiProperty } from '@nestjs/swagger';
import { CatalogBaseResponseDto } from '../../dto/catalog-base-response.dto';

export class ModifierGroupSummaryResponseDto extends CatalogBaseResponseDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  required: boolean;

  @ApiProperty()
  minSelect: number;

  @ApiProperty()
  maxSelect: number;

  @ApiProperty()
  multi: boolean;
}

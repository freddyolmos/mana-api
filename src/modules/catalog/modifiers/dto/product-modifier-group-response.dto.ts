import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ModifierGroupResponseDto } from './modifier-group-response.dto';

export class ProductModifierGroupResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  productId: number;

  @ApiProperty()
  groupId: number;

  @ApiProperty()
  sortOrder: number;

  @ApiProperty({ type: ModifierGroupResponseDto })
  @Type(() => ModifierGroupResponseDto)
  group: ModifierGroupResponseDto;
}

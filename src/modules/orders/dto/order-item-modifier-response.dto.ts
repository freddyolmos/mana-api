import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ModifierGroupSummaryResponseDto } from '../../catalog/modifiers/dto/modifier-group-summary-response.dto';
import { ModifierOptionResponseDto } from '../../catalog/modifiers/dto/modifier-option-response.dto';

export class OrderItemModifierResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  orderItemId: number;

  @ApiProperty()
  groupId: number;

  @ApiProperty()
  optionId: number;

  @ApiProperty()
  priceDeltaSnapshot: number;

  @ApiProperty({ type: ModifierGroupSummaryResponseDto })
  @Type(() => ModifierGroupSummaryResponseDto)
  group: ModifierGroupSummaryResponseDto;

  @ApiProperty({ type: ModifierOptionResponseDto })
  @Type(() => ModifierOptionResponseDto)
  option: ModifierOptionResponseDto;
}

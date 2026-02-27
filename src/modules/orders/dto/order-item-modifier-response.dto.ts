import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ModifierGroupSummaryResponseDto } from '../../catalog/modifiers/dto/modifier-group-summary-response.dto';
import { ModifierOptionResponseDto } from '../../catalog/modifiers/dto/modifier-option-response.dto';

export class OrderItemModifierResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  orderItemId: number;

  @ApiPropertyOptional()
  groupId?: number | null;

  @ApiPropertyOptional()
  optionId?: number | null;

  @ApiProperty()
  priceDeltaSnapshot: number;

  @ApiPropertyOptional({ type: ModifierGroupSummaryResponseDto })
  @Type(() => ModifierGroupSummaryResponseDto)
  group?: ModifierGroupSummaryResponseDto | null;

  @ApiPropertyOptional({ type: ModifierOptionResponseDto })
  @Type(() => ModifierOptionResponseDto)
  option?: ModifierOptionResponseDto | null;
}

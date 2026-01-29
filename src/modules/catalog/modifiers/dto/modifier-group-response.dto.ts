import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ModifierGroupSummaryResponseDto } from './modifier-group-summary-response.dto';
import { ModifierOptionResponseDto } from './modifier-option-response.dto';

export class ModifierGroupResponseDto extends ModifierGroupSummaryResponseDto {
  @ApiProperty({ type: ModifierOptionResponseDto, isArray: true })
  @Type(() => ModifierOptionResponseDto)
  options: ModifierOptionResponseDto[];
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';

class SelectedModifierDto {
  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @Min(1)
  groupId!: number;

  @ApiPropertyOptional({ example: [2, 3] })
  @IsArray()
  @IsInt({ each: true })
  optionIds!: number[];
}

export class UpdateOrderItemDto {
  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  @Min(1)
  qty?: number;

  @ApiPropertyOptional({
    description: 'Modifiers seleccionados por grupo',
    example: [{ groupId: 1, optionIds: [2] }],
    type: [SelectedModifierDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SelectedModifierDto)
  modifiers?: SelectedModifierDto[];
}

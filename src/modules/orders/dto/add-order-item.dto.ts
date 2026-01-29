import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class SelectedModifierDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  groupId!: number;

  @ApiProperty({ example: [2, 3] })
  @IsArray()
  @IsInt({ each: true })
  optionIds!: number[];
}

export class AddOrderItemDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  productId!: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  qty!: number;

  @ApiPropertyOptional({ example: 'Sin hielo' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  notes?: string;

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

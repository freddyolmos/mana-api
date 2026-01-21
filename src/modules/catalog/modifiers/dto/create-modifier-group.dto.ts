import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateModifierGroupDto {
  @ApiProperty({ example: 'Salsas' })
  @IsString()
  @MaxLength(80)
  name!: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  minSelect?: number;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxSelect?: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Permite seleccionar más de 1 opción',
  })
  @IsOptional()
  @IsBoolean()
  multi?: boolean;
}

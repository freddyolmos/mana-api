import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateTableDto {
  @ApiProperty({ example: 'M1' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(40)
  name!: string;
}

import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'freddy@test.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Freddy123' })
  @IsString()
  @MinLength(6)
  password: string;
}

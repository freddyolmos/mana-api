import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'freddy@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'freddy123' })
  @IsString()
  @MinLength(6)
  password: string;
}

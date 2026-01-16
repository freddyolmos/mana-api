import { IsEmail, IsString, MinLength, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from 'src/common/constants/roles';

export class CreateUserDto {
  @ApiProperty({ example: 'Freddy' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'freddy@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'ADMIN' })
  @IsEnum(Role)
  role: Role;
}

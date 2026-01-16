import { IsEnum } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from 'src/common/constants/roles';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({ example: 'Freddy 2' })
  name?: string;

  @ApiPropertyOptional({ example: 'freddynuevo@mail.com' })
  email?: string;

  @ApiPropertyOptional({ example: 'nuevoPassword123' })
  password?: string;

  @ApiPropertyOptional({ example: 'ADMIN' })
  @IsEnum(Role)
  role?: Role;
}

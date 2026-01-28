import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { hashPassword } from '../common/utils/hash.util';
import { Prisma } from '@prisma/client';
import { UserResponseDto } from './dto/user-response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const hashedPassword = await hashPassword(dto.password);
    return this.prisma.user.create({
      data: {
        ...dto,
        password: hashedPassword,
      },
    });
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        id: 'asc',
      },
    });
    return users.map((user) => plainToInstance(UserResponseDto, user));
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return plainToInstance(UserResponseDto, user);
  }

  async update(id: number, dto: UpdateUserDto) {
    const data: Prisma.UserUpdateInput = {
      ...dto,
    };
    if (dto.password) {
      data.password = await hashPassword(dto.password);
    }
    return this.prisma.user.update({ where: { id }, data });
  }

  remove(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }
}

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

  private readonly userSelect = {
    id: true,
    name: true,
    email: true,
    role: true,
    isActive: true,
    createdAt: true,
    updatedAt: true,
  };

  private toResponse(user: unknown) {
    return plainToInstance(UserResponseDto, user);
  }

  async create(dto: CreateUserDto) {
    const hashedPassword = await hashPassword(dto.password);
    const user = await this.prisma.user.create({
      data: {
        ...dto,
        password: hashedPassword,
      },
      select: this.userSelect,
    });
    return this.toResponse(user);
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      select: this.userSelect,
      orderBy: {
        id: 'asc',
      },
    });
    return users.map((user) => this.toResponse(user));
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: this.userSelect,
    });
    if (!user) throw new NotFoundException('User not found');
    return this.toResponse(user);
  }

  async update(id: number, dto: UpdateUserDto) {
    const data: Prisma.UserUpdateInput = {
      ...dto,
    };
    if (dto.password) {
      data.password = await hashPassword(dto.password);
    }
    const user = await this.prisma.user.update({
      where: { id },
      data,
      select: this.userSelect,
    });
    return this.toResponse(user);
  }

  async remove(id: number) {
    const user = await this.prisma.user.delete({
      where: { id },
      select: this.userSelect,
    });
    return this.toResponse(user);
  }
}

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateCategoryDto } from './dto/create-category.dto';
import { PrismaService } from '../../../prisma/prisma.service';
import { QueryCategoriesDto } from './dto/query-categories.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  private toResponse(category: unknown) {
    return plainToInstance(CategoryResponseDto, category);
  }

  async create(dto: CreateCategoryDto) {
    const existing = await this.prisma.category.findUnique({
      where: { name: dto.name },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException('A category with that name already exists.');
    }

    const category = await this.prisma.category.create({
      data: {
        name: dto.name.trim(),
        sortOrder: dto.sortOrder ?? 0,
      },
    });
    return this.toResponse(category);
  }

  async findAll(query: QueryCategoriesDto) {
    const categories = await this.prisma.category.findMany({
      where: {
        isActive: query.isActive,
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
    return categories.map((category) => this.toResponse(category));
  }

  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) throw new NotFoundException('Categoría no encontrada.');
    return this.toResponse(category);
  }

  async update(id: number, dto: UpdateCategoryDto) {
    await this.findOne(id);

    if (dto.name) {
      const existing = await this.prisma.category.findUnique({
        where: { name: dto.name },
        select: { id: true },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('Ya existe una categoría con ese nombre.');
      }
    }

    const category = await this.prisma.category.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
    });
    return this.toResponse(category);
  }

  async toggleActive(id: number) {
    const category = await this.findOne(id);

    const updated = await this.prisma.category.update({
      where: { id },
      data: { isActive: !category.isActive },
    });
    return this.toResponse(updated);
  }

  async remove(id: number) {
    await this.findOne(id);

    try {
      const deleted = await this.prisma.category.delete({
        where: { id },
      });
      return this.toResponse(deleted);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new ConflictException(
          'No se puede eliminar la categoría porque tiene productos asociados.',
        );
      }
      throw error;
    }
  }
}

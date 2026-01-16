import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { PrismaService } from '../../../prisma/prisma.service';
import { QueryCategoriesDto } from './dto/query-categories.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCategoryDto) {
    const existing = await this.prisma.category.findUnique({
      where: { name: dto.name },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException('A category with that name already exists.');
    }

    return this.prisma.category.create({
      data: {
        name: dto.name.trim(),
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  async findAll(query: QueryCategoriesDto) {
    return this.prisma.category.findMany({
      where: {
        isActive: query.isActive,
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) throw new NotFoundException('Categoría no encontrada.');
    return category;
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

    return this.prisma.category.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
    });
  }
}

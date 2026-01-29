import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  private toResponse(product: unknown) {
    return plainToInstance(ProductResponseDto, product);
  }

  async create(dto: CreateProductDto) {
    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
      select: { id: true },
    });
    if (!category) throw new NotFoundException('La categoría no existe.');

    const existing = await this.prisma.product.findFirst({
      where: { categoryId: dto.categoryId, name: dto.name },
      select: { id: true },
    });
    if (existing)
      throw new ConflictException(
        'Ya existe un producto con ese nombre en esa categoría.',
      );

    const product = await this.prisma.product.create({
      data: {
        name: dto.name.trim(),
        description: dto.description?.trim(),
        imageUrl: dto.imageUrl?.trim(),
        price: dto.price,
        categoryId: dto.categoryId,
      },
      include: { category: true },
    });
    return this.toResponse(product);
  }

  async findAll(query: QueryProductsDto) {
    const products = await this.prisma.product.findMany({
      where: {
        ...(query.categoryId ? { categoryId: query.categoryId } : {}),
        ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
        ...(query.q
          ? {
              name: {
                contains: query.q,
                mode: 'insensitive',
              },
            }
          : {}),
      },
      orderBy: [{ categoryId: 'asc' }, { name: 'asc' }],
      include: { category: true },
    });
    return products.map((product) => this.toResponse(product));
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!product) throw new NotFoundException('Product not found.');
    return this.toResponse(product);
  }

  async update(id: number, dto: UpdateProductDto) {
    const current = await this.prisma.product.findUnique({
      where: { id },
      select: { id: true, categoryId: true },
    });
    if (!current) throw new NotFoundException('Product not found.');

    const nextCategoryId = dto.categoryId ?? current.categoryId;

    if (dto.name || dto.categoryId) {
      const nameToCheck = (dto.name ??
        (
          await this.prisma.product.findUnique({
            where: { id },
            select: { name: true },
          })
        )?.name) as string;

      const existing = await this.prisma.product.findFirst({
        where: {
          id: { not: id },
          categoryId: nextCategoryId,
          name: nameToCheck,
        },
        select: { id: true },
      });

      if (existing) {
        throw new ConflictException(
          'Ya existe un producto con ese nombre en esa categoría.',
        );
      }
    }

    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
        select: { id: true },
      });
      if (!category) throw new NotFoundException('La categoría no existe.');
    }

    const product = await this.prisma.product.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description?.trim() }
          : {}),
        ...(dto.imageUrl !== undefined
          ? { imageUrl: dto.imageUrl?.trim() }
          : {}),
        ...(dto.price !== undefined ? { price: dto.price } : {}),
        ...(dto.categoryId !== undefined ? { categoryId: dto.categoryId } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
      include: { category: true },
    });
    return this.toResponse(product);
  }

  async toggleActive(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      select: { id: true, isActive: true },
    });
    if (!product) throw new NotFoundException('Producto no encontrado.');

    const updated = await this.prisma.product.update({
      where: { id },
      data: { isActive: !product.isActive },
      include: { category: true },
    });
    return this.toResponse(updated);
  }
}

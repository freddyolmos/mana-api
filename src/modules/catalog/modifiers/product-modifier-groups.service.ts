import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AttachModifierGroupDto } from './dto/attach-modifier-group.dto';
import { ProductModifierGroupResponseDto } from './dto/product-modifier-group-response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ProductModifierGroupsService {
  constructor(private readonly prisma: PrismaService) {}

  private toResponse(rel: unknown) {
    return plainToInstance(ProductModifierGroupResponseDto, rel);
  }

  async attach(productId: number, dto: AttachModifierGroupDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });
    if (!product) throw new NotFoundException('Producto no encontrado.');

    const group = await this.prisma.modifierGroup.findUnique({
      where: { id: dto.groupId },
      select: { id: true },
    });
    if (!group) throw new NotFoundException('Grupo no encontrado.');

    const existing = await this.prisma.productModifierGroup.findFirst({
      where: { productId, groupId: dto.groupId },
      select: { id: true },
    });
    if (existing)
      throw new ConflictException('Ese grupo ya está asignado al producto.');

    const relation = await this.prisma.productModifierGroup.create({
      data: {
        productId,
        groupId: dto.groupId,
        sortOrder: dto.sortOrder ?? 0,
      },
      include: {
        group: { include: { options: true } },
      },
    });
    return this.toResponse(relation);
  }

  async listForProduct(productId: number) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });
    if (!product) throw new NotFoundException('Producto no encontrado.');

    const relations = await this.prisma.productModifierGroup.findMany({
      where: { productId },
      orderBy: [{ sortOrder: 'asc' }],
      include: {
        group: {
          include: {
            options: { where: { isActive: true }, orderBy: { name: 'asc' } },
          },
        },
      },
    });
    return relations.map((rel) => this.toResponse(rel));
  }

  async detach(productId: number, groupId: number) {
    const rel = await this.prisma.productModifierGroup.findFirst({
      where: { productId, groupId },
      select: { id: true },
    });
    if (!rel)
      throw new NotFoundException('Relación producto-grupo no encontrada.');

    await this.prisma.productModifierGroup.delete({ where: { id: rel.id } });
    return { ok: true };
  }
}

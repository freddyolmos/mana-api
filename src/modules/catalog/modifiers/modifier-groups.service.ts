import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateModifierGroupDto } from './dto/create-modifier-group.dto';
import { QueryModifierGroupsDto } from './dto/query-modifier-groups.dto';
import { UpdateModifierGroupDto } from './dto/update-modifier-group.dto';

function validateGroupRules(input: {
  required: boolean;
  minSelect: number;
  maxSelect: number;
  multi: boolean;
}) {
  const { required, minSelect, maxSelect, multi } = input;

  if (required && minSelect < 1) {
    throw new BadRequestException(
      'Si required=true entonces minSelect debe ser >= 1.',
    );
  }
  if (maxSelect < minSelect) {
    throw new BadRequestException('maxSelect debe ser >= minSelect.');
  }
  if (!multi && maxSelect !== 1) {
    return { ...input, maxSelect: 1 };
  }
  return input;
}

@Injectable()
export class ModifierGroupsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateModifierGroupDto) {
    const existing = await this.prisma.modifierGroup.findUnique({
      where: { name: dto.name },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException('Ya existe un grupo con ese nombre.');
    }

    const required = dto.required ?? false;
    const multi = dto.multi ?? false;
    const minSelect = dto.minSelect ?? 0;
    const maxSelect = dto.maxSelect ?? (multi ? 99 : 1);

    const fixed = validateGroupRules({ required, minSelect, maxSelect, multi });

    return this.prisma.modifierGroup.create({
      data: {
        name: dto.name.trim(),
        required: fixed.required,
        minSelect: fixed.minSelect,
        maxSelect: fixed.maxSelect,
        multi: fixed.multi,
      },
      include: { options: true },
    });
  }

  async findAll(query: QueryModifierGroupsDto) {
    return this.prisma.modifierGroup.findMany({
      where: {
        isActive: query.isActive,
      },
      orderBy: [{ name: 'asc' }],
      include: { options: true },
    });
  }

  async findOne(id: number) {
    const group = await this.prisma.modifierGroup.findUnique({
      where: { id },
      include: { options: true },
    });
    if (!group) throw new NotFoundException('Grupo no encontrado.');
    return group;
  }

  async update(id: number, dto: UpdateModifierGroupDto) {
    const current = await this.prisma.modifierGroup.findUnique({
      where: { id },
    });
    if (!current) throw new NotFoundException('Grupo no encontrado.');

    if (dto.name) {
      const existing = await this.prisma.modifierGroup.findUnique({
        where: { name: dto.name },
        select: { id: true },
      });
      if (existing && existing.id !== id)
        throw new ConflictException('Ya existe un grupo con ese nombre.');
    }

    const required = dto.required ?? current.required;
    const multi = dto.multi ?? current.multi;
    const minSelect = dto.minSelect ?? current.minSelect;
    const maxSelect = dto.maxSelect ?? current.maxSelect;

    const fixed = validateGroupRules({ required, minSelect, maxSelect, multi });

    return this.prisma.modifierGroup.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        required: fixed.required,
        minSelect: fixed.minSelect,
        maxSelect: fixed.maxSelect,
        multi: fixed.multi,
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
      include: { options: true },
    });
  }

  async toggleActive(id: number) {
    const group = await this.prisma.modifierGroup.findUnique({
      where: { id },
      select: { id: true, isActive: true },
    });
    if (!group) throw new NotFoundException('Grupo no encontrado.');

    return this.prisma.modifierGroup.update({
      where: { id },
      data: { isActive: !group.isActive },
      include: { options: true },
    });
  }

  async remove(id: number) {
    const group = await this.prisma.modifierGroup.findUnique({
      where: { id },
      include: { options: true },
    });
    if (!group) throw new NotFoundException('Grupo no encontrado.');

    const blockingReferences = await this.prisma.orderItemModifier.count({
      where: {
        groupId: id,
        orderItem: {
          order: {
            status: {
              in: [
                OrderStatus.OPEN,
                OrderStatus.SENT_TO_KITCHEN,
                OrderStatus.READY,
              ],
            },
          },
        },
      },
    });
    if (blockingReferences > 0) {
      throw new ConflictException(
        'No se puede eliminar el grupo porque está ligado a órdenes activas.',
      );
    }

    try {
      await this.prisma.modifierGroup.delete({ where: { id } });
      return group;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new ConflictException(
          'No se puede eliminar el grupo por referencias relacionadas.',
        );
      }
      throw error;
    }
  }
}

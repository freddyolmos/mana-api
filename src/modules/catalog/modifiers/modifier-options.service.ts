import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateModifierOptionDto } from './dto/create-modifier-option.dto';
import { UpdateModifierOptionDto } from './dto/update-modifier-option.dto';

@Injectable()
export class ModifierOptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateModifierOptionDto) {
    const group = await this.prisma.modifierGroup.findUnique({
      where: { id: dto.groupId },
      select: { id: true },
    });
    if (!group) throw new NotFoundException('Group not found.');

    const existing = await this.prisma.modifierOption.findFirst({
      where: { groupId: dto.groupId, name: dto.name },
      select: { id: true },
    });
    if (existing)
      throw new ConflictException(
        'There is already an option with that name in this group.',
      );

    return this.prisma.modifierOption.create({
      data: {
        groupId: dto.groupId,
        name: dto.name.trim(),
        priceDelta: new Prisma.Decimal(dto.priceDelta ?? 0),
      },
    });
  }

  async update(id: number, dto: UpdateModifierOptionDto) {
    const current = await this.prisma.modifierOption.findUnique({
      where: { id },
      select: { id: true, groupId: true, name: true },
    });
    if (!current) throw new NotFoundException('Option not found.');

    if (dto.name) {
      const existing = await this.prisma.modifierOption.findFirst({
        where: {
          id: { not: id },
          groupId: current.groupId,
          name: dto.name,
        },
        select: { id: true },
      });
      if (existing)
        throw new ConflictException(
          'There is already an option with that name in this group.',
        );
    }

    return this.prisma.modifierOption.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(dto.priceDelta !== undefined
          ? { priceDelta: new Prisma.Decimal(dto.priceDelta) }
          : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
    });
  }

  async toggleActive(id: number) {
    const opt = await this.prisma.modifierOption.findUnique({
      where: { id },
      select: { id: true, isActive: true },
    });
    if (!opt) throw new NotFoundException('Option not found.');

    return this.prisma.modifierOption.update({
      where: { id },
      data: { isActive: !opt.isActive },
    });
  }
}

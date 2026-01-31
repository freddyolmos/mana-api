import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { QueryTablesDto } from './dto/query-tables.dto';

@Injectable()
export class TablesService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly tableSelect = {
    id: true,
    name: true,
    status: true,
    createdAt: true,
    updatedAt: true,
  };

  async create(dto: CreateTableDto) {
    const exists = await this.prisma.table.findUnique({
      where: { name: dto.name },
      select: { id: true },
    });
    if (exists) throw new BadRequestException('La mesa ya existe.');

    return this.prisma.table.create({
      data: { name: dto.name.trim() },
      select: this.tableSelect,
    });
  }

  async findAll(query: QueryTablesDto) {
    return this.prisma.table.findMany({
      where: {
        ...(query.status ? { status: query.status } : {}),
      },
      orderBy: { id: 'asc' },
      select: this.tableSelect,
    });
  }

  async findOne(id: number) {
    const table = await this.prisma.table.findUnique({
      where: { id },
      select: this.tableSelect,
    });
    if (!table) throw new NotFoundException('Mesa no encontrada.');
    return table;
  }

  async update(id: number, dto: UpdateTableDto) {
    const table = await this.prisma.table.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!table) throw new NotFoundException('Mesa no encontrada.');

    if (dto.name) {
      const exists = await this.prisma.table.findUnique({
        where: { name: dto.name },
        select: { id: true },
      });
      if (exists && exists.id !== id) {
        throw new BadRequestException('La mesa ya existe.');
      }
    }

    return this.prisma.table.update({
      where: { id },
      data: {
        ...(dto.name ? { name: dto.name.trim() } : {}),
      },
      select: this.tableSelect,
    });
  }

  async remove(id: number) {
    const table = await this.prisma.table.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!table) throw new NotFoundException('Mesa no encontrada.');

    return this.prisma.table.delete({
      where: { id },
      select: this.tableSelect,
    });
  }
}

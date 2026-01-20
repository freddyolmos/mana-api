import {
  Body,
  Controller,
  Post,
  UseGuards,
  Get,
  Query,
  Patch,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ModifierGroupsService } from './modifier-groups.service';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CreateModifierGroupDto } from './dto/create-modifier-group.dto';

import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../common/constants/roles';
import { QueryModifierGroupsDto } from './dto/query-modifier-groups.dto';
import { UpdateModifierGroupDto } from './dto/update-modifier-group.dto';

@ApiTags('Modifier Groups')
@Controller('modifier-groups')
@ApiBearerAuth('access-token')
export class ModifierGroupsController {
  constructor(private readonly modifiersGroupService: ModifierGroupsService) {}

  @ApiOperation({ summary: 'Create modifier group' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  create(@Body() dto: CreateModifierGroupDto) {
    return this.modifiersGroupService.create(dto);
  }

  @ApiOperation({ summary: 'List all modifiers group' })
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() query: QueryModifierGroupsDto) {
    return this.modifiersGroupService.findAll(query);
  }

  @ApiOperation({ summary: 'Get group by id (includ options)' })
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.modifiersGroupService.findOne(id);
  }

  @ApiOperation({ summary: 'Update group' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateModifierGroupDto,
  ) {
    return this.modifiersGroupService.update(id, dto);
  }

  @ApiOperation({ summary: 'Toggle activo/inactivo' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id/toggle-active')
  toggleActive(@Param('id', ParseIntPipe) id: number) {
    return this.modifiersGroupService.toggleActive(id);
  }
}

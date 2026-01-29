import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ModifierOptionsService } from './modifier-options.service';
import { CreateModifierOptionDto } from './dto/create-modifier-option.dto';
import { UpdateModifierOptionDto } from './dto/update-modifier-option.dto';

import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../common/constants/roles';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { ModifierOptionResponseDto } from './dto/modifier-option-response.dto';

@ApiTags('Modifier Options')
@Controller('modifier-options')
@ApiBearerAuth('access-token')
export class ModifierOptionsController {
  constructor(private readonly service: ModifierOptionsService) {}

  @ApiOperation({ summary: 'Create modifier option' })
  @ApiCreatedResponse({ type: ModifierOptionResponseDto })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  create(@Body() dto: CreateModifierOptionDto) {
    return this.service.create(dto);
  }

  @ApiOperation({ summary: 'Update modifier option' })
  @ApiOkResponse({ type: ModifierOptionResponseDto })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateModifierOptionDto,
  ) {
    return this.service.update(id, dto);
  }

  @ApiOperation({ summary: 'Toggle active/inactive' })
  @ApiOkResponse({ type: ModifierOptionResponseDto })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id/toggle-active')
  toggleActive(@Param('id', ParseIntPipe) id: number) {
    return this.service.toggleActive(id);
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProductModifierGroupsService } from './product-modifier-groups.service';
import { AttachModifierGroupDto } from './dto/attach-modifier-group.dto';

import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../common/constants/roles';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';

@ApiTags('Product Modifier Groups')
@Controller('products/:productId/modifier-groups')
export class ProductModifierGroupsController {
  constructor(private readonly service: ProductModifierGroupsService) {}

  @ApiOperation({ summary: 'Assign group to product' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  attach(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() dto: AttachModifierGroupDto,
  ) {
    return this.service.attach(productId, dto);
  }

  @ApiOperation({ summary: 'List groups (and options) for product' })
  @Get()
  list(@Param('productId', ParseIntPipe) productId: number) {
    return this.service.listForProduct(productId);
  }

  @ApiOperation({ summary: 'Remove product group' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':groupId')
  detach(
    @Param('productId', ParseIntPipe) productId: number,
    @Param('groupId', ParseIntPipe) groupId: number,
  ) {
    return this.service.detach(productId, groupId);
  }
}

import {
  Post,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AddOrderItemDto } from './dto/add-order-item.dto';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/constants/roles';

@ApiTags('Orders')
@ApiBearerAuth('access-token')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @ApiOperation({ summary: 'Create a new order' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  @ApiOperation({ summary: 'List complet order' })
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.getById(id);
  }

  @ApiOperation({ summary: 'Add item to orden' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post(':id/items')
  addItem(@Param('id', ParseIntPipe) id: number, @Body() dto: AddOrderItemDto) {
    return this.ordersService.addItem(id, dto);
  }

  @ApiOperation({ summary: 'Delete item orden' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id/items/:itemId')
  removeItem(
    @Param('id', ParseIntPipe) id: number,
    @Param('itemId', ParseIntPipe) itemId: number,
  ) {
    return this.ordersService.removeItem(id, itemId);
  }

  @ApiOperation({ summary: 'Send order to kitchen (change status)' })
  @UseGuards(JwtAuthGuard)
  @Post(':id/send-to-kitchen')
  sendToKitchen(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.sendToKitchen(id);
  }
}

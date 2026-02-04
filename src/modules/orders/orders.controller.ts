import {
  Post,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AddOrderItemDto } from './dto/add-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/constants/roles';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { AuthenticatedUser } from 'src/common/types/user.types';
import { OrderResponseDto } from './dto/order-response.dto';
import { OrderItemResponseDto } from './dto/order-item-response.dto';

@ApiTags('Orders')
@ApiBearerAuth('access-token')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @ApiOperation({ summary: 'Create a new order' })
  @ApiCreatedResponse({ type: OrderResponseDto })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  create(@Body() dto: CreateOrderDto, @CurrentUser() user: AuthenticatedUser) {
    return this.ordersService.create(dto, user.userId);
  }

  @ApiOperation({ summary: 'List complet order' })
  @ApiOkResponse({ type: OrderResponseDto })
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.getById(id);
  }

  @ApiOperation({ summary: 'Add item to orden' })
  @ApiCreatedResponse({ type: OrderItemResponseDto })
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

  @ApiOperation({ summary: 'Update order item (qty/modifiers)' })
  @ApiOkResponse({ type: OrderItemResponseDto })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id/items/:itemId')
  updateItem(
    @Param('id', ParseIntPipe) id: number,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() dto: UpdateOrderItemDto,
  ) {
    return this.ordersService.updateItem(id, itemId, dto);
  }

  @ApiOperation({ summary: 'Send order to kitchen (change status)' })
  @ApiOkResponse({ type: OrderResponseDto })
  @UseGuards(JwtAuthGuard)
  @Post(':id/send-to-kitchen')
  sendToKitchen(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.ordersService.sendToKitchen(id, user.userId);
  }

  @ApiOperation({ summary: 'Mark order as READY' })
  @ApiOkResponse({ type: OrderResponseDto })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.KITCHEN, Role.ADMIN)
  @Post(':id/mark-ready')
  markReady(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.ordersService.markReady(id, user.userId);
  }

  @ApiOperation({ summary: 'Attach table to order' })
  @ApiOkResponse({ type: OrderResponseDto })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CASHIER, Role.ADMIN)
  @Patch(':id/attach-table/:tableId')
  attachTable(
    @Param('id', ParseIntPipe) id: number,
    @Param('tableId', ParseIntPipe) tableId: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.ordersService.attachTable(id, tableId, user.userId);
  }

  @ApiOperation({ summary: 'Release table from order' })
  @ApiOkResponse({ type: OrderResponseDto })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CASHIER, Role.ADMIN)
  @Patch(':id/release-table')
  releaseTable(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.ordersService.releaseTable(id, user.userId);
  }
}

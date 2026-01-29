import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/constants/roles';
import { KitchenService } from './kitchen.service';
import { QueryKitchenOrdersDto } from './dto/query-kitchen-orders.dto';
import { UpdateKitchenItemDto } from './dto/update-kitchen-item.dto';
import { OrderResponseDto } from '../orders/dto/order-response.dto';
import { OrderItemResponseDto } from '../orders/dto/order-item-response.dto';

@ApiTags('Kitchen')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.KITCHEN, Role.ADMIN)
@Controller('kitchen')
export class KitchenController {
  constructor(private readonly kitchenService: KitchenService) {}

  @ApiOperation({ summary: 'List orders in kitchen' })
  @ApiOkResponse({ type: OrderResponseDto, isArray: true })
  @Get('orders')
  listOrders(@Query() query: QueryKitchenOrdersDto) {
    return this.kitchenService.listKitchenOrders(query);
  }

  @ApiOperation({ summary: 'Get kitchen order by ID' })
  @ApiOkResponse({ type: OrderResponseDto })
  @Get('orders/:id')
  getOrder(@Param('id', ParseIntPipe) id: number) {
    return this.kitchenService.getKitchenOrder(id);
  }

  @ApiOperation({ summary: 'Update kitchen item status' })
  @ApiOkResponse({ type: OrderItemResponseDto })
  @Patch('orders/:id/items/:itemId')
  updateItemStatus(
    @Param('id', ParseIntPipe) id: number,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() dto: UpdateKitchenItemDto,
  ) {
    return this.kitchenService.updateKitchenItemStatus(id, itemId, dto);
  }
}

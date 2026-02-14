import {
  Controller,
  Get,
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
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/constants/roles';
import { TicketsService } from './tickets.service';
import { TicketResponseDto } from './dto/ticket-response.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/types/user.types';

@ApiTags('Tickets')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.CASHIER, Role.ADMIN)
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @ApiOperation({ summary: 'Create ticket from order' })
  @ApiCreatedResponse({ type: TicketResponseDto })
  @Post('from-order/:orderId')
  createFromOrder(
    @Param('orderId', ParseIntPipe) orderId: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.ticketsService.createFromOrder(orderId, user.userId);
  }

  @ApiOperation({ summary: 'Get ticket by ID' })
  @ApiOkResponse({ type: TicketResponseDto })
  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.ticketsService.getById(id);
  }

  @ApiOperation({ summary: 'Cancel ticket' })
  @ApiOkResponse({ type: TicketResponseDto })
  @Patch(':id/cancel')
  cancel(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.ticketsService.cancel(id, user.userId);
  }

  @ApiOperation({ summary: 'Close ticket (mark as PAID)' })
  @ApiOkResponse({ type: TicketResponseDto })
  @Post(':id/close')
  close(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.ticketsService.close(id, user.userId);
  }
}

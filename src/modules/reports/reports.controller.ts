import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { ReportRangeQueryDto } from './dto/report-range-query.dto';
import { TopProductsQueryDto } from './dto/top-products-query.dto';
import { SalesByHourQueryDto } from './dto/sales-by-hour-query.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/constants/roles';

@ApiTags('Reports')
@ApiBearerAuth('access-token')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @ApiOperation({ summary: 'Get reports summary' })
  @ApiOkResponse({ description: 'Summary metrics and sales by day' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.CASHIER)
  @Get('summary')
  getSummary(@Query() query: ReportRangeQueryDto) {
    return this.reportsService.getSummary(query.from, query.to);
  }

  @ApiOperation({ summary: 'Get top products' })
  @ApiOkResponse({ description: 'Top products by gross sales' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.CASHIER)
  @Get('top-products')
  getTopProducts(@Query() query: TopProductsQueryDto) {
    return this.reportsService.getTopProducts(
      query.from,
      query.to,
      query.limit ?? 10,
    );
  }

  @ApiOperation({ summary: 'Get payments breakdown' })
  @ApiOkResponse({ description: 'Payments breakdown by method' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.CASHIER)
  @Get('payments-breakdown')
  getPaymentsBreakdown(@Query() query: ReportRangeQueryDto) {
    return this.reportsService.getPaymentsBreakdown(query.from, query.to);
  }

  @ApiOperation({ summary: 'Get sales by hour' })
  @ApiOkResponse({ description: 'Hourly sales by timezone' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.CASHIER)
  @Get('sales-by-hour')
  getSalesByHour(@Query() query: SalesByHourQueryDto) {
    return this.reportsService.getSalesByHour(
      query.from,
      query.to,
      query.tz ?? 'UTC',
    );
  }
}

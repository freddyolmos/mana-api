import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
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
import { TablesService } from './tables.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { QueryTablesDto } from './dto/query-tables.dto';
import { TableResponseDto } from './dto/table-response.dto';

@ApiTags('Tables')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @ApiOperation({ summary: 'Create table' })
  @ApiCreatedResponse({ type: TableResponseDto })
  @Roles(Role.ADMIN)
  @Post()
  create(@Body() dto: CreateTableDto) {
    return this.tablesService.create(dto);
  }

  @ApiOperation({ summary: 'List tables' })
  @ApiOkResponse({ type: TableResponseDto, isArray: true })
  @Roles(Role.CASHIER, Role.ADMIN)
  @Get()
  findAll(@Query() query: QueryTablesDto) {
    return this.tablesService.findAll(query);
  }

  @ApiOperation({ summary: 'Get table by ID' })
  @ApiOkResponse({ type: TableResponseDto })
  @Roles(Role.CASHIER, Role.ADMIN)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tablesService.findOne(id);
  }

  @ApiOperation({ summary: 'Update table' })
  @ApiOkResponse({ type: TableResponseDto })
  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTableDto) {
    return this.tablesService.update(id, dto);
  }

  @ApiOperation({ summary: 'Delete table' })
  @ApiOkResponse({ type: TableResponseDto })
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tablesService.remove(id);
  }
}

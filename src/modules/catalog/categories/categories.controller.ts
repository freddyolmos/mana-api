import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/constants/roles';
import { CreateCategoryDto } from './dto/create-category.dto';
import { QueryCategoriesDto } from './dto/query-categories.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryResponseDto } from './dto/category-response.dto';

@ApiBearerAuth('access-token')
@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @ApiOperation({ summary: 'Create a new category' })
  @ApiCreatedResponse({ type: CategoryResponseDto })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @ApiOperation({ summary: 'List all categories' })
  @ApiOkResponse({ type: CategoryResponseDto, isArray: true })
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() query: QueryCategoriesDto) {
    return this.categoriesService.findAll(query);
  }

  @ApiOperation({ summary: 'Get category by ID' })
  @ApiOkResponse({ type: CategoryResponseDto })
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.findOne(id);
  }

  @ApiOperation({ summary: 'Update category' })
  @ApiOkResponse({ type: CategoryResponseDto })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, dto);
  }

  @ApiOperation({ summary: 'Active/Inactive Toggle' })
  @ApiOkResponse({ type: CategoryResponseDto })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id/toggle-active')
  toggleActive(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.toggleActive(id);
  }
}

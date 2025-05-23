import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { MaterialService } from './material.service';
import { CreateMaterialDto, UpdateMaterialDto } from './dto';
import { Material } from '@prisma/client';

@ApiTags('Materials')
@Controller('api/v1/materials')
export class MaterialController {
  constructor(private readonly materialService: MaterialService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new material with types' })
  @ApiResponse({ status: 201, description: 'Material created successfully' })
  create(@Body() dto: CreateMaterialDto) {
    return this.materialService.createMaterial(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all materials with paging' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of materials' })
  getAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    return this.materialService.getAllMaterials(pageNum, limitNum);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get material by ID' })
  @ApiResponse({ status: 200, description: 'Material found' })
  @ApiResponse({ status: 404, description: 'Material not found' })
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.materialService.getMaterialById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update material by ID' })
  @ApiResponse({ status: 200, description: 'Material updated' })
  @ApiResponse({ status: 404, description: 'Material not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMaterialDto,
  ) {
    return this.materialService.updateMaterial(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete material by ID' })
  @ApiResponse({ status: 200, description: 'Material deleted' })
  @ApiResponse({ status: 404, description: 'Material not found' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.materialService.deleteMaterial(id);
  }
}

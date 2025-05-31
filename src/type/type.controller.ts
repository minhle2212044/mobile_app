import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { TypeService } from './type.service';
import { Type } from '@prisma/client';

@Controller('api/v1/types')
export class TypeController {
  constructor(private readonly materialService: TypeService) {}

  @Post(':materialId/types')
  async addTypeToMaterial(
    @Param('materialId') materialId: string,
    @Body() data: { name: string; points: number; isHazardous: boolean },
  ): Promise<Type> {
    return this.materialService.addTypeToMaterial(+materialId, data);
  }

  @Patch('types/:name')
  async updateType(
    @Param('name') name: string,
    @Body() data: { points?: number; isHazardous?: boolean },
  ): Promise<Type> {
    return this.materialService.updateType(name, data);
  }

  @Delete('types/:name')
  async deleteType(@Param('name') name: string): Promise<Type> {
    return this.materialService.deleteType(name);
  }

  @Get()
  async getAllTypes(
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    return this.materialService.getAllTypes(pageNum, limitNum);
  }

  @Get(':id')
  async getTypesByMaterialId(
    @Param('id') id: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    return this.materialService.getTypesByMaterialId(+id, pageNum, limitNum);
  }
}

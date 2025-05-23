import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Query,
  Body,
  Delete,
  UploadedFile,
  UseInterceptors,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiParam, ApiBody } from '@nestjs/swagger';
import { CenterService } from './center.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Center } from '@prisma/client';

@Controller('api/v1/centers')
export class CenterController {
  constructor(private readonly centerService: CenterService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async createCenter(
    @Body() body: any,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<Center> {
    if (typeof body.workingDays === 'string') {
      body.workingDays = JSON.parse(body.workingDays);
    }
    return this.centerService.createCenter(body, file);
  }

  @Get()
  async getAllCenters(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ): Promise<{ data: Center[]; total: number; page: number; limit: number }> {
    return this.centerService.getAllCenters(Number(page), Number(limit));
  }

  @Get(':id')
  async getCenterById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Center> {
    return this.centerService.getCenterById(id);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('file'))
  updateCenter(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const parsedBody = {
        ...body,
        workingDays: body.workingDays ? JSON.parse(body.workingDays) : undefined,
    };
    return this.centerService.updateCenter(id, parsedBody, file);
  }

  @Delete(':id')
  async deleteCenter(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Center> {
    return this.centerService.deleteCenter(id);
  }

  @Post(':id/collectables')
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ schema: { example: { typeNames: ['PET', 'HDPE'] } } })
  async addCollectables(
    @Param('id') id: string,
    @Body('typeNames') typeNames: string[],
  ) {
    const centerId = parseInt(id);
    return this.centerService.addCollectableTypesToCenter(centerId, typeNames);
  }

  @Post(':id/schedules')
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({
    schema: {
        example: {
        schedules: [
            { day: "Monday", startTime: "2025-05-24T08:00:00Z", endTime: "2025-05-24T11:00:00Z" },
            { day: "Wednesday", startTime: "2025-05-26T13:00:00Z", endTime: "2025-05-26T17:00:00Z" }
        ]
        }
    }
  })
  async addSchedules(
    @Param('id') id: string,
    @Body('schedules') schedules: { day: string; startTime: Date; endTime: Date }[]
  ) {
    const centerId = parseInt(id);
    return this.centerService.addSchedulesToCenter(centerId, schedules);
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  Put,
  Patch,
  Delete,
  ParseIntPipe,
  UseGuards,
  UploadedFile, 
  UseInterceptors,
  NotFoundException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { RewardService } from './reward.service';
import { JwtGuard } from '../auth/guard';
import { Reward } from '@prisma/client';

@ApiTags('Reward')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('api/v1/rewards')
export class RewardController {
  constructor(private readonly rewardService: RewardService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Create a reward' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Gift Card 50K' },
        type: { type: 'string', example: 'Gift Card' },
        description: { type: 'string', example: 'Gift card for e-commerce use' },
        points: { type: 'integer', example: 100 },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Reward created' })
  async create(
    @Body() data: Omit<Reward, 'id'>,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.rewardService.createReward(data, file);
  }

  @Get()
  @ApiOperation({ summary: 'Get all rewards' })
  @ApiResponse({
    status: 200,
    description: 'List of all rewards',
    schema: {
      example: [
        {
          id: 1,
          name: 'Gift Card 50K',
          type: 'Gift Card',
          description: 'Gift card for e-commerce use',
          points: 100,
          isFavorite: true,
        },
      ],
    },
  })
  getAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('userId') userId: number,
  ) {
    return this.rewardService.getAllRewards(Number(page), Number(limit), Number(userId));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get reward by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Reward detail by ID',
    schema: {
      example: {
        id: 1,
        name: 'Gift Card 50K',
        type: 'Gift Card',
        description: 'Gift card for e-commerce use',
        points: 100,
      },
    },
  })
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.rewardService.getRewardById(id);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Update reward by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Updated Name' },
        type: { type: 'string', example: 'Updated Type' },
        description: { type: 'string', example: 'Updated Description' },
        points: { type: 'integer', example: 200 },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Reward updated successfully' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<Reward>,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.rewardService.updateReward(id, data, file);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete reward by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Reward deleted successfully' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.rewardService.deleteReward(id);
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'Get rewards by type with pagination' })
  @ApiParam({ name: 'type', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Filtered rewards with pagination',
  })
  getByTypeWithPagination(
    @Param('type') type: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.rewardService.getRewardsByType(
      type,
      parseInt(page, 10),
      parseInt(limit, 10),
    );
  }

  @Patch('favorite')
  async toggleFavoriteReward(
    @Query('userId') userId: string,
    @Query('rewardId') rewardId: string,
  ) {
    const uid = parseInt(userId);
    const rid = parseInt(rewardId);
    if (isNaN(uid) || isNaN(rid)) {
      throw new NotFoundException('Invalid userId or rewardId');
    }

    return this.rewardService.toggleFavoriteReward(uid, rid);
  }
}

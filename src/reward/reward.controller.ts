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
  ApiQuery
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
  @ApiQuery({ name: 'userId', type: Number, required: true })
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
        imageUrl: 'https://example.com/image.jpg',
        favorite: true,
      },
    },
  })
  getById(
    @Param('id', ParseIntPipe) id: number,
    @Query('userId', ParseIntPipe) userId: number,
  ) {
    return this.rewardService.getRewardById(id, userId);
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

  @Post('cart')
  async addToCart(
    @Query('id') userId: number,
    @Body('rewardId') rewardId: number,
  ) {
    return this.rewardService.addToCart(Number(userId), rewardId);
  }

  @Patch('increase/:id')
  async increaseQuantity(
    @Param('id') userId: number,
    @Body('rewardId') rewardId: number,
  ) {
    return this.rewardService.incrementQuantity(Number(userId), rewardId);
  }

  @Patch('decrease/:id')
  async decreaseQuantity(
    @Param('id') userId: number,
    @Body('rewardId') rewardId: number,
  ) {
    return this.rewardService.decrementQuantity(Number(userId), rewardId);
  }

  @Get('cart/:id')
  async getCartItems(@Param('id') userId: number) {
    return this.rewardService.getCartItems(Number(userId));
  }

  @Get(':userId/summary')
  async getCartSummary(@Param('userId') userId: number) {
    return this.rewardService.getCartSummary(Number(userId));
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  ParseIntPipe,
  UseGuards,
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
  @ApiOperation({ summary: 'Create a reward' })
  @ApiBody({
    schema: {
      example: {
        name: 'Gift Card 50K',
        type: 'Gift Card',
        description: 'Gift card for e-commerce use',
        points: 100,
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Reward created' })
  create(@Body() data: Omit<Reward, 'id'>) {
    return this.rewardService.createReward(data);
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
        },
      ],
    },
  })
  getAll() {
    return this.rewardService.getAllRewards();
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
  @ApiOperation({ summary: 'Update reward by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Reward updated successfully' })
  update(@Param('id', ParseIntPipe) id: number, @Body() data: Partial<Reward>) {
    return this.rewardService.updateReward(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete reward by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Reward deleted successfully' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.rewardService.deleteReward(id);
  }
}

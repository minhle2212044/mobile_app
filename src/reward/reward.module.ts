import { Module } from '@nestjs/common';
import { RewardController } from './reward.controller';
import { RewardService } from './reward.service';
import { PrismaService } from '../prisma.service';

@Module({
    controllers: [RewardController],
    providers: [RewardService, PrismaService]
})

export class RewardModule {}
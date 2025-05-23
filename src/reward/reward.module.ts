import { Module } from '@nestjs/common';
import { RewardController } from './reward.controller';
import { RewardService } from './reward.service';
import { PrismaService } from '../prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Module({
    controllers: [RewardController],
    providers: [RewardService, PrismaService, CloudinaryService]
})

export class RewardModule {}
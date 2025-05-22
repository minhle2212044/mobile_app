import { Injectable, NotFoundException,ForbiddenException} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Reward } from '@prisma/client';

@Injectable()
export class RewardService {
  constructor(private prisma: PrismaService) {}

  async createReward(data: Omit<Reward, 'id'>): Promise<Reward> {
    return this.prisma.reward.create({ data });
  }

  async getAllRewards(): Promise<Reward[]> {
    return this.prisma.reward.findMany();
  }

  async getRewardById(id: number): Promise<Reward> {
    const reward = await this.prisma.reward.findUnique({ where: { id } });
    if (!reward) throw new NotFoundException('Reward not found');
    return reward;
  }

  async updateReward(id: number, data: Partial<Reward>): Promise<Reward> {
    await this.getRewardById(id);
    return this.prisma.reward.update({
      where: { id },
      data,
    });
  }

  async deleteReward(id: number): Promise<Reward> {
    await this.getRewardById(id);
    return this.prisma.reward.delete({ where: { id } });
  }
} 

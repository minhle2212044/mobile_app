import { Injectable, NotFoundException, ForbiddenException} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Reward } from '@prisma/client';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class RewardService {
  constructor(private prisma: PrismaService, private cloudinary: CloudinaryService) {}

  async createReward(data: Omit<Reward, 'id'>, file?: Express.Multer.File): Promise<Reward> {
    let imageUrl = '';
    if (file) {
      const uploadRes = await this.cloudinary.uploadImage(file, 'rewards');
      imageUrl = uploadRes.secure_url;
    }

    return this.prisma.reward.create({
      data: {
        ...data,
        points: Number(data.points),
        imageUrl: imageUrl,
      },
    });
  }

  async getAllRewards(
    page = 1,
    limit = 10,
    userId: number
  ): Promise<{
    data: (Reward & { isFavorite: boolean })[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;

    const [rewards, total] = await this.prisma.$transaction([
      this.prisma.reward.findMany({
        skip,
        take: limit,
        orderBy: {
          id: 'asc',
        },
        include: {
          receivers: {
            where: { customerId: userId },
            select: { id: true },
          },
        },
      }),
      this.prisma.reward.count(),
    ]);

    const data = rewards.map((reward: Reward & { receivers: { id: number }[] }) => ({
      ...reward,
      isFavorite: reward.receivers.length > 0,
    }));

    return {
      data,
      total,
      page,
      limit,
    };
  }


  async getRewardById(id: number, userId: number): Promise<Reward & { favorite: boolean }> {
    const reward = await this.prisma.reward.findUnique({
      where: { id },
    });

    if (!reward) throw new NotFoundException('Reward not found');

    const favorite = await this.prisma.customerReward.findFirst({
      where: {
        rewardId: id,
        customerId: userId,
      },
    });

    return {
      ...reward,
      favorite: !!favorite,
    };
  }

  async updateReward(
    id: number,
    data: Partial<Reward>,
    file?: Express.Multer.File,
  ): Promise<Reward> {
    await this.getRewardById1(id);

    let imageUrl = '';

    if (file) {
      const uploadRes = await this.cloudinary.uploadImage(file, 'rewards');
      imageUrl = uploadRes.secure_url;
    }

    return this.prisma.reward.update({
      where: { id },
      data: {
        ...data,
        points: Number(data.points),
        ...(imageUrl && { imageUrl }),
      },
    });
  }
  async getRewardById1(id: number): Promise<Reward> {
    const reward = await this.prisma.reward.findUnique({ where: { id } });
    if (!reward) throw new NotFoundException('Reward not found');
    return reward;
  }

  async deleteReward(id: number): Promise<Reward> {
    await this.getRewardById1(id);
    return this.prisma.reward.delete({ where: { id } });
  }

  async getRewardsByType(
    type: string,
    page = 1,
    limit = 1,
  ): Promise<{ data: Reward[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.reward.findMany({
        where: {
          type: {
            equals: type,
            mode: 'insensitive',
          },
        },
        skip,
        take: limit,
        orderBy: {
          id: 'asc',
        },
      }),
      this.prisma.reward.count({
        where: {
          type: {
            equals: type,
            mode: 'insensitive',
          },
        },
      }),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async toggleFavoriteReward(userId: number, rewardId: number): Promise<{ status: 'added' | 'removed' }> {
    const reward = await this.prisma.reward.findUnique({ where: { id: rewardId } });
    if (!reward) throw new NotFoundException(`Reward with ID ${rewardId} not found`);

    const existing = await this.prisma.customerReward.findUnique({
      where: {
        customerId_rewardId: {
          customerId: userId,
          rewardId,
        },
      },
    });

    if (existing) {
      await this.prisma.customerReward.delete({
        where: {
          customerId_rewardId: {
            customerId: userId,
            rewardId,
          },
        },
      });
      return { status: 'removed' };
    } else {
      await this.prisma.customerReward.create({
        data: {
          customerId: userId,
          rewardId,
        },
      });
      return { status: 'added' };
    }
  }
} 

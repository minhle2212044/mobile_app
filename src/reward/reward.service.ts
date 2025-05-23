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
  ): Promise<{ data: Reward[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.reward.findMany({
        skip,
        take: limit,
        orderBy: {
          id: 'asc',
        },
      }),
      this.prisma.reward.count(),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async getRewardById(id: number): Promise<Reward> {
    const reward = await this.prisma.reward.findUnique({ where: { id } });
    if (!reward) throw new NotFoundException('Reward not found');
    return reward;
  }

  async updateReward(
    id: number,
    data: Partial<Reward>,
    file?: Express.Multer.File,
  ): Promise<Reward> {
    await this.getRewardById(id);

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

  async deleteReward(id: number): Promise<Reward> {
    await this.getRewardById(id);
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
          id: 'asc', // 👈 sắp xếp theo id từ nhỏ đến lớn
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
} 

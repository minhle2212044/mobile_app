import { Injectable, NotFoundException, ForbiddenException} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CartItem, Reward } from '@prisma/client';
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

  // 1. Thêm sản phẩm vào giỏ hàng
async addToCart(customerId: number, rewardId: number): Promise<CartItem> {
  const reward = await this.prisma.reward.findUnique({ where: { id: rewardId } });
  if (!reward) throw new NotFoundException('Reward not found');

  try {
    return await this.prisma.cartItem.create({
      data: {
        customerId,
        rewardId,
        quantity: 1,
      },
    });
  } catch (error) {
    // Nếu đã tồn tại thì tăng số lượng lên
    return this.incrementQuantity(customerId, rewardId);
  }
}

// 2. Tăng số lượng
async incrementQuantity(customerId: number, rewardId: number): Promise<CartItem> {
  console.log('Incrementing quantity for customerId:', customerId, 'rewardId:', rewardId);
  const item = await this.prisma.cartItem.findUnique({
    where: {
      customerId_rewardId: {
        customerId,
        rewardId,
      },
    },
  });

  if (!item) throw new NotFoundException('Item not found in cart');

  return this.prisma.cartItem.update({
    where: {
      customerId_rewardId: {
        customerId,
        rewardId,
      },
    },
    data: {
      quantity: item.quantity + 1,
    },
  });
}

// 3. Giảm số lượng (nếu = 0 thì xóa)
async decrementQuantity(customerId: number, rewardId: number): Promise<{ message: string }> {
  console.log('Incrementing quantity for customerId:', customerId, 'rewardId:', rewardId);
  const item = await this.prisma.cartItem.findUnique({
    where: {
      customerId_rewardId: {
        customerId,
        rewardId,
      },
    },
  });

  if (!item) throw new NotFoundException('Item not found in cart');

  if (item.quantity <= 1) {
    await this.prisma.cartItem.delete({
      where: {
        customerId_rewardId: {
          customerId,
          rewardId,
        },
      },
    });
    return { message: 'Item removed from cart' };
  }

  await this.prisma.cartItem.update({
    where: {
      customerId_rewardId: {
        customerId,
        rewardId,
      },
    },
    data: {
      quantity: item.quantity - 1,
    },
  });

  return { message: 'Quantity decreased' };
}

async getCartItems(customerId: number): Promise<(CartItem & { reward: Reward })[]> {
  return this.prisma.cartItem.findMany({
    where: { customerId },
    include: {
      reward: true,
    },
  });
}

async getCartSummary(customerIdRaw: number | string): Promise<{
  items: (CartItem & { reward: Reward })[];
  totalQuantity: number;
  totalPoints: number;
  Points: number;
  address: string;
}> {
  const customerId = Number(customerIdRaw);

  // Lấy giỏ hàng
  const items = await this.prisma.cartItem.findMany({
    where: { customerId },
    include: { reward: true },
  });

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPoints = items.reduce((sum, item) => sum + item.quantity * item.reward.points, 0);

  const customer = await this.prisma.customer.findUnique({
    where: { id: customerId },
    include: {
      user: {
        select: { address: true },
      },
    },
  });

  if (!customer || !customer.user) {
    throw new Error('Customer or user not found');
  }

  return {
    items,
    totalQuantity,
    totalPoints,
    Points: customer.points,
    address: customer.user.address,
  };
}

} 

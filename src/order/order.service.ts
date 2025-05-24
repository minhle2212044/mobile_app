// order.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateRewardOrderDto, CreateMaterialOrderDto } from './dto';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  private generateOrderCode(): string {
    return (
      'ORD-' +
      new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 12) +
      '-' +
      Math.floor(1000 + Math.random() * 9000)
    );
  }
   async createMaterialOrder(data: CreateMaterialOrderDto) {
    const { items, ...orderData } = data;

    const points = await this.calculatePoints(items || []);
    const code = this.generateOrderCode();

    const order = await this.prisma.order.create({
      data: {
        ...orderData,
        code,
        date: new Date(),
        points,
        items: {
          create: items.map((item) => ({
            typeName: item.typeName,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        items: true,
        customer: true,
      },
    });

    await this.prisma.customer.update({
      where: { id: order.customerId },
      data: {
        points: { increment: points },
      },
    });

    return order;
  }

  async createRewardOrder(data: CreateRewardOrderDto) {
    const { rewards, ...orderData } = data;

    const rewardPoints = await this.calculateRewardPoints(rewards || []);
    const code = this.generateOrderCode();

    const order = await this.prisma.order.create({
      data: {
        ...orderData,
        code,
        date: new Date(),
        points: -rewardPoints,
        rewards: {
          create: rewards.map((reward) => ({
            rewardId: reward.rewardId,
            quantity: reward.quantity,
          })),
        },
      },
      include: {
        rewards: true,
        customer: true,
      },
    });

    await this.prisma.customer.update({
      where: { id: order.customerId },
      data: {
        points: { decrement: rewardPoints },
      },
    });

    return order;
  }

  // Tính điểm từ danh sách loại vật liệu
  private async calculatePoints(items: { typeName: string; quantity: number }[]): Promise<number> {
    let total = 0;
    for (const item of items) {
      const type = await this.prisma.type.findUnique({
        where: { name: item.typeName },
      });
      if (type) total += type.points * item.quantity;
    }
    return total;
  }

  // Tính điểm cần trừ khi đổi quà
  private async calculateRewardPoints(rewards: { rewardId: number; quantity: number }[]): Promise<number> {
    let total = 0;
    for (const reward of rewards) {
      const r = await this.prisma.reward.findUnique({
        where: { id: reward.rewardId },
      });
      if (r) total += r.points * reward.quantity;
    }
    return total;
  }

  async getAllOrders(query: { page?: number; limit?: number }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const [orders, total] = await this.prisma.$transaction([
        this.prisma.order.findMany({
        skip,
        take: limit,
        orderBy: { id: 'desc' },
        include: {
            customer: { include: { user: true } },
            center: true,
            items: true,
            rewards: true,
        },
        }),
        this.prisma.order.count(),
    ]);

    return {
        data: orders,
        meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
        },
    };
  }

  async getOrderById(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        customer: { include: { user: true } },
        center: true,
        items: true,
        rewards: true,
      },
    });

    if (!order) throw new NotFoundException('Order not found');
    return order;
  }
}

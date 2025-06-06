// order.service.ts
import { Injectable, NotFoundException, BadRequestException,  } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateRewardOrderDto, CreateMaterialOrderDto } from './dto';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService, private cloudinary: CloudinaryService) {}

  private generateOrderCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const numbers = '23456789';
    const getRandom = (set: string) => set[Math.floor(Math.random() * set.length)];

    let code = '';
    for (let i = 0; i < 3; i++) code += getRandom(chars);
    for (let i = 0; i < 3; i++) code += getRandom(numbers);

    return code;
  }
   async createMaterialOrder(data: CreateMaterialOrderDto, file?: Express.Multer.File) {
    const { items, note, receiveDate, schedule, ...orderData } = data;

    const points = await this.calculatePoints(items || []);
    const code = this.generateOrderCode();

    let imageUrl = '';
    if (file) {
      const uploadRes = await this.cloudinary.uploadImage(file, 'orders');
      imageUrl = uploadRes.secure_url;
    }
    const order = await this.prisma.order.create({
      data: {
        ...orderData,
        code,
        date: new Date(),
        receiveDate: receiveDate ? new Date(receiveDate) : new Date(),
        points,
        note,
        imageUrl,
        schedule,
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

    return {
      ...order,
      points,
    };
  }

  
  async createRewardOrder(userId: number) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: userId },
    });

    if (!customer) {
      throw new BadRequestException('Không tìm thấy khách hàng tương ứng với userId.');
    }

    const customerId = customer.id;

    const cartItems = await this.prisma.cartItem.findMany({
      where: { customerId },
    });

    if (cartItems.length === 0) {
      throw new BadRequestException('Giỏ hàng trống, không thể tạo đơn đổi thưởng.');
    }

    const rewards = cartItems.map((item) => ({
      rewardId: item.rewardId,
      quantity: item.quantity,
    }));

    const rewardPoints = await this.calculateRewardPoints(rewards);
    const code = this.generateOrderCode();

    const order = await this.prisma.order.create({
      data: {
        customerId,
        centerId: 2,
        transport: 'Xe máy',
        status: 'pending',
        code,
        date: new Date(),
        receiveDate: (() => {
          const today = new Date();
          const nextWeek = new Date(today);
          nextWeek.setDate(today.getDate() + 7);
          return nextWeek;
        })(),
        points: -rewardPoints,
        type: "REWARD",
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
      where: { id: customerId },
      data: {
        points: { decrement: rewardPoints },
      },
    });

    await this.prisma.cartItem.deleteMany({
      where: { customerId },
    });

    return order;
  }


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
  async getRewardOrders(userId: number, status?: string) {
    return this.prisma.order.findMany({
      where: {
        customerId: userId,
        type: 'REWARD',
        ...(status ? { status } : {}),
      },
      orderBy: { date: 'desc' },
    });
  }
  async getMaterialOrders(userId: number, status?: string) {
    return this.prisma.order.findMany({
      where: {
        customerId: userId,
        type: 'MATERIAL',
        ...(status ? { status } : {}),
      },
      orderBy: { date: 'desc' },
    });
  }

  async getRewardOrderDetail(orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        rewards: {
          include: {
            reward: true, // để lấy tên và điểm phần thưởng
          },
        },
        customer: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!order || order.type !== 'REWARD') {
      throw new NotFoundException('Không tìm thấy đơn hàng đổi thưởng.');
    }

    const items = order.rewards.map((item) => ({
      name: item.reward.name,
      quantity: item.quantity,
      points: item.reward.points,
      totalPoints: item.reward.points * item.quantity,
    }));

    const totalPoints = items.reduce((sum, item) => sum + item.totalPoints, 0);

    return {
      id: order.id,
      code: order.code,
      date: order.date,
      status: order.status,
      items,
      totalPoints,
      address: order.customer.user.address,
    };
  }

  async getMaterialOrderDetail(orderId: number) {
  const order = await this.prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          type: true, // để lấy thông tin loại vật liệu
        },
      },
      customer: {
        include: {
          user: true, // lấy thông tin người dùng từ customer
        },
      },
      center: {
        include: {
          days: true, // lấy thêm lịch làm việc của trung tâm
        },
      },
    },
  });

  if (!order) {
    throw new NotFoundException(`Không tìm thấy đơn hàng với ID ${orderId}`);
  }

  // Format thời gian nhận
  const formattedReceiveDate = order.receiveDate.toLocaleString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return {
    orderId: order.id,
    code: order.code,
    address: order.center.address,
    receiveTime: formattedReceiveDate,
    totalPoints: order.points,
    status: order.status,
    schedule: order.schedule,
    materials: order.items.map((item) => ({
      typeName: item.typeName,
      quantity: item.quantity,
      isHazardous: item.type.isHazardous,
      pointsPerKg: item.type.points,
    })),
    sender: {
      name: order.customer.user.name,
      phone: order.customer.user.tel,
      email: order.customer.user.email,
      address: order.customer.user.address,
    },
    workingTimes: order.center.days.map((day) => ({
      day: day.day,
      startTime: day.startTime.toISOString(),
      endTime: day.endTime.toISOString(),
    })),
  };
}


}

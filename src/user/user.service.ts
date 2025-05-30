import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from 'src/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  private handleUnknownError(error: any, action: string) {
    if (error instanceof NotFoundException) throw error;
    if (error instanceof ForbiddenException) throw error;
    if (error instanceof BadRequestException) throw error;
    if (error instanceof ConflictException) throw error;

    console.error(`Error during ${action}:`, error);
    throw new InternalServerErrorException(`Failed to ${action}`);
  }

  async findAll() {
    try {
      return await this.prisma.user.findMany();
    } catch (error) {
      throw new InternalServerErrorException('Failed to get users');
    }
  }

  async findOne(id: number) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id } });
      if (!user) throw new NotFoundException('User not found');
      return user;
    } catch (error) {
      throw this.handleUnknownError(error, 'get user');
    }
  }

  async update(id: number, data: Partial<User>) {
    try {
      await this.ensureUserExists(id);
      return await this.prisma.user.update({ where: { id }, data });
    } catch (error) {
      throw this.handleUnknownError(error, 'update user');
    }
  }

  async remove(id: number) {
    try {
      await this.ensureUserExists(id);
      return await this.prisma.user.delete({ where: { id } });
    } catch (error) {
      throw this.handleUnknownError(error, 'delete user');
    }
  }

  async findByEmail(email: string) {
    try {
      const user = await this.prisma.user.findUnique({ where: { email } });
      if (!user) throw new NotFoundException('User not found');
      return user;
    } catch (error) {
      throw this.handleUnknownError(error, 'find user by email');
    }
  }

  async updatePassword(id: number, newPassword: string) {
    try {
      await this.ensureUserExists(id);
      const hashedPassword = await this.hashPassword(newPassword);
      return await this.prisma.user.update({
        where: { id },
        data: { password: hashedPassword },
      });
    } catch (error) {
      throw this.handleUnknownError(error, 'update password');
    }
  }

  private async hashPassword(password: string): Promise<string> {
    const argon2 = await import('argon2');
    return argon2.hash(password);
  }

  private async ensureUserExists(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
  }

  async getRecycledMaterialStatsByUser(userId: number) {
  try {
    // Lấy thông tin customerId từ user
    const customer = await this.prisma.customer.findUnique({
      where: { id: userId },
      include: {
        orders: {
          include: {
            items: {
              include: {
                type: {
                  include: {
                    material: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found for this user');
    }

    // Gom khối lượng theo category
    const categoryMap: Record<string, number> = {};
    let totalKg = 0;

    for (const order of customer.orders) {
      for (const item of order.items) {
        const category = item.type.material.category;
        const quantity = item.quantity;
        categoryMap[category] = (categoryMap[category] || 0) + quantity;
        totalKg += quantity;
      }
    }

    // Trả về kết quả dạng { category, totalKg, percentage }
    const result = Object.entries(categoryMap).map(([category, kg]) => ({
      category,
      totalKg: kg,
      percentage: totalKg > 0 ? (kg / totalKg) * 100 : 0,
    }));

    return result;
  } catch (error) {
    throw this.handleUnknownError(error, 'get recycled material stats by user');
  }
}

}

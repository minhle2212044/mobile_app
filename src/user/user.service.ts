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
}

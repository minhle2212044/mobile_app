import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { PrismaService } from '../prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Module({
    controllers: [OrderController],
    providers: [OrderService, PrismaService, CloudinaryService]
})

export class OrderModule {}
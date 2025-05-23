import { Module } from '@nestjs/common';
import { TypeController } from './type.controller';
import { TypeService } from './type.service';
import { PrismaService } from '../prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Module({
    controllers: [TypeController],
    providers: [TypeService, PrismaService, CloudinaryService]
})

export class TypeModule {}
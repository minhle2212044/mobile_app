import { Module } from '@nestjs/common';
import { CenterController } from './center.controller';
import { CenterService } from './center.service';
import { PrismaService } from '../prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Module({
    controllers: [CenterController],
    providers: [CenterService, PrismaService, CloudinaryService]
})

export class CenterModule {}
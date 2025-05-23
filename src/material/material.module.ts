import { Module } from '@nestjs/common';
import { MaterialController } from './material.controller';
import { MaterialService } from './material.service';
import { PrismaService } from '../prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Module({
    controllers: [MaterialController],
    providers: [MaterialService, PrismaService, CloudinaryService]
})

export class MaterialModule {}
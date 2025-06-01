import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Type } from '@prisma/client';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class TypeService {
  constructor(private readonly prisma: PrismaService, private cloudinary: CloudinaryService) {}

  async addTypeToMaterial(materialId: number, data: {
    name: string;
    points: number;
    isHazardous: boolean;
  },
  file?: Express.Multer.File,): Promise<Type> {
    const material = await this.prisma.material.findUnique({ where: { id: materialId } });
    if (!material) throw new NotFoundException(`Material with ID ${materialId} not found`);

    let imageUrl = '';
    if (file) {
      const uploadRes = await this.cloudinary.uploadImage(file, 'types');
      imageUrl = uploadRes.secure_url;
    }
    return this.prisma.type.create({
      data: {
        ...data,
        materialId,
        description: 'No description yet',
        ...(imageUrl ? { imageUrl } : {}),
      },
    });
  }

  async updateType(name: string, data: {
    points?: number;
    isHazardous?: boolean;
  },
  file?: Express.Multer.File,): Promise<Type> {
    const existingType = await this.prisma.type.findUnique({ where: { name } });
    if (!existingType) throw new NotFoundException(`Type with name "${name}" not found`);

    let imageUrl: string | undefined;
    if (file) {
      const uploadRes = await this.cloudinary.uploadImage(file, 'types');
      imageUrl = uploadRes.secure_url;
    }
    return this.prisma.type.update({
      where: { name },
      data: {
        ...data,
        ...(imageUrl ? { imageUrl } : {}),
      },
    });
  }

  async deleteType(name: string): Promise<Type> {
    const type = await this.prisma.type.findUnique({ where: { name } });
    if (!type) throw new NotFoundException(`Type with name "${name}" not found`);

    return this.prisma.type.delete({ where: { name } });
  }

  async getAllTypes(page = 1, limit = 20): Promise<{ data: Type[]; total: number }> {
    const [data, total] = await this.prisma.$transaction([
        this.prisma.type.findMany({
        skip: (page - 1) * limit,
        take: limit,
        include: { material: true },
        }),
        this.prisma.type.count(),
    ]);

    return { data, total };
  }

  async getTypesByMaterialId(materialId: number, page = 1, limit = 10): Promise<{ data: Type[]; total: number }> {
    const material = await this.prisma.material.findUnique({ where: { id: materialId } });
    if (!material) throw new NotFoundException(`Material with ID ${materialId} not found`);

    const [data, total] = await this.prisma.$transaction([
        this.prisma.type.findMany({
        where: { materialId },
        skip: (page - 1) * limit,
        take: limit,
        }),
        this.prisma.type.count({ where: { materialId } }),
    ]);
    return { data, total };
  }
}
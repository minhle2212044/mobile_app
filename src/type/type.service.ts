import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Type } from '@prisma/client';

@Injectable()
export class TypeService {
  constructor(private readonly prisma: PrismaService) {}

  async addTypeToMaterial(materialId: number, data: {
    name: string;
    points: number;
    isHazardous: boolean;
  }): Promise<Type> {
    const material = await this.prisma.material.findUnique({ where: { id: materialId } });
    if (!material) throw new NotFoundException(`Material with ID ${materialId} not found`);

    return this.prisma.type.create({
      data: {
        ...data,
        materialId,
      },
    });
  }

  async updateType(name: string, data: {
    points?: number;
    isHazardous?: boolean;
  }): Promise<Type> {
    const existingType = await this.prisma.type.findUnique({ where: { name } });
    if (!existingType) throw new NotFoundException(`Type with name "${name}" not found`);

    return this.prisma.type.update({
      where: { name },
      data,
    });
  }

  async deleteType(name: string): Promise<Type> {
    const type = await this.prisma.type.findUnique({ where: { name } });
    if (!type) throw new NotFoundException(`Type with name "${name}" not found`);

    return this.prisma.type.delete({ where: { name } });
  }

  async getAllTypes(page = 1, limit = 10): Promise<{ data: Type[]; total: number }> {
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
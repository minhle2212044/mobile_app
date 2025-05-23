import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Material } from '@prisma/client';

@Injectable()
export class MaterialService {
  constructor(private readonly prisma: PrismaService) {}

  async createMaterial(data: {
    category: string;
    name: string;
    description: string;
    instruction: string;
    types: {
      name: string;
      points: number;
      isHazardous: boolean;
    }[];
  }): Promise<Material> {
    return this.prisma.material.create({
      data: {
        category: data.category,
        name: data.name,
        description: data.description,
        instruction: data.instruction,
        types: {
          create: data.types.map((type) => ({
            ...type,
          })),
        },
      },
      include: { types: true },
    });
  }

  async getAllMaterials(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [materials, total] = await this.prisma.$transaction([
      this.prisma.material.findMany({
        skip,
        take: limit,
        orderBy: { id: 'asc' },
        include: { types: true },
      }),
      this.prisma.material.count(),
    ]);

    return {
      data: materials,
      total,
      page,
      limit,
    };
  }

  async getMaterialById(id: number): Promise<Material> {
    const material = await this.prisma.material.findUnique({
      where: { id },
      include: { types: true },
    });

    if (!material) {
      throw new NotFoundException(`Material with ID ${id} not found`);
    }

    return material;
  }

  async updateMaterial(
    id: number,
    data: {
      category?: string;
      name?: string;
      description?: string;
      instruction?: string;
    },
  ): Promise<Material> {
    await this.getMaterialById(id);

    return this.prisma.material.update({
      where: { id },
      data,
      include: { types: true },
    });
  }

  async deleteMaterial(id: number): Promise<Material> {
    await this.getMaterialById(id);

    await this.prisma.type.deleteMany({ where: { materialId: id } });

    return this.prisma.material.delete({ where: { id } });
  }
}

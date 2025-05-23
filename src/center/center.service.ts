import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Center } from '@prisma/client';
import { CloudinaryService } from '../cloudinary/cloudinary.service';


interface CreateCenterInput extends Omit<Center, 'id' | 'imageUrl'> {
  workingDays?: {
    day: string;
    startTime: Date;
    endTime: Date;
  }[];
}

@Injectable()
export class CenterService {
  constructor(private prisma: PrismaService, private cloudinary: CloudinaryService) {}

  async createCenter(
    data: CreateCenterInput,
    file?: Express.Multer.File,
  ): Promise<Center> {
    let imageUrl = '';

    if (file) {
      const uploadRes = await this.cloudinary.uploadImage(file, 'centers');
      imageUrl = uploadRes.secure_url;
    }

    const { workingDays, ...centerData } = data;

    const center = await this.prisma.center.create({
      data: {
        ...centerData,
        collectorId: Number(centerData.collectorId),
        imageUrl,
      },
    });

    if (workingDays && workingDays.length > 0) {
      await this.prisma.centerDay.createMany({
        data: workingDays.map((day) => ({
          centerId: center.id,
          day: day.day,
          startTime: new Date(day.startTime),
          endTime: new Date(day.endTime),
        })),
        skipDuplicates: true,
      });
    }

    const centerWithDays = await this.prisma.center.findUnique({
        where: { id: center.id },
            include: {
            days: true,
        },
    });

    if (!centerWithDays) {
    throw new NotFoundException(`Center with ID ${center.id} not found`);
    }

    return centerWithDays;
  }

  async getCenterById(id: number): Promise<Center> {
    const center = await this.prisma.center.findUnique({ where: { id } });
    if (!center) throw new NotFoundException('Center not found');
    return center;
  }

  async getAllCenters(
    page = 1,
    limit = 10
  ): Promise<{ data: Center[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;

    const [data, total] = await this.prisma.$transaction([
        this.prisma.center.findMany({
        skip,
        take: limit,
        orderBy: { id: 'asc' },
        include: {
            days: true,
        },
        }),
        this.prisma.center.count(),
    ]);

    return { data, total, page, limit };
  }

  async updateCenter(
    id: number,
    data: Partial<CreateCenterInput>,
    file?: Express.Multer.File,
  ): Promise<Center> {
    const existingCenter = await this.prisma.center.findUnique({ where: { id } });
    if (!existingCenter) {
        throw new NotFoundException(`Center with ID ${id} not found`);
    }

    let imageUrl = existingCenter.imageUrl;

    if (file) {
        const uploadRes = await this.cloudinary.uploadImage(file, 'centers');
        imageUrl = uploadRes.secure_url;
    }

    const { workingDays, ...updateData } = data;

    await this.prisma.center.update({
        where: { id },
        data: {
        ...updateData,
        imageUrl,
        },
    });

    if (workingDays && workingDays.length > 0) {
        await this.prisma.centerDay.deleteMany({ where: { centerId: id } });
        await this.prisma.centerDay.createMany({
            data: workingDays.map((day) => ({
                centerId: id,
                day: day.day,
                startTime: new Date(day.startTime),
                endTime: new Date(day.endTime),
            })),
        });
    }

    const updatedCenter = await this.prisma.center.findUnique({
        where: { id },
        include: { days: true },
    });

    if (!updatedCenter) {
        throw new NotFoundException(`Center with ID ${id} not found after update`);
    }

    return updatedCenter;
  }


  async deleteCenter(id: number): Promise<Center> {
    await this.getCenterById(id);
    return this.prisma.center.delete({ where: { id } });
  }

  async addCollectableTypesToCenter(centerId: number, typeNames: string[]) {
    const center = await this.prisma.center.findUnique({ where: { id: centerId } });
    if (!center) throw new NotFoundException(`Center with ID ${centerId} not found`);

    const types = await this.prisma.type.findMany({
        where: { name: { in: typeNames } },
    });

    const existingNames = types.map((t) => t.name);
    const invalidNames = typeNames.filter((t) => !existingNames.includes(t));

    if (invalidNames.length > 0) {
        throw new NotFoundException(`Type(s) not found: ${invalidNames.join(', ')}`);
    }

    const collectData = typeNames.map((typeName) => ({
        centerId,
        typeName,
    }));

    await this.prisma.centerCollect.createMany({
        data: collectData,
        skipDuplicates: true,
    });

    return { message: 'Types added to center', centerId, typeNames };
    }

  async addSchedulesToCenter(
    centerId: number,
    schedules: {
        startTime: Date;
        endTime: Date;
    }[]
  ) {
    const center = await this.prisma.center.findUnique({ where: { id: centerId } });
    if (!center) {
        throw new NotFoundException(`Center with ID ${centerId} not found`);
    }

    await this.prisma.schedule.createMany({
        data: schedules.map(s => ({
            centerId,
            startTime: new Date(s.startTime),
            endTime: new Date(s.endTime),
        })),
        skipDuplicates: true,
    });

    return { message: 'Schedules added successfully', centerId, count: schedules.length };
  }
}
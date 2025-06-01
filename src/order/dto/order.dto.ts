import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderDto {
  code: string;
  transport: string;
  status: string;
  customerId: number;
  centerId: number;
  items?: {
    typeName: string;s
    quantity: number;
  }[];
  rewards?: {
    rewardId: number;
    quantity: number;
  }[];
}

export class CreateMaterialOrderDto {
  customerId: number;
  centerId: number;
  transport: string;
  status: string;
  items: {
    typeName: string;
    quantity: number;
  }[];
}

export class CreateRewardOrderDto {
  @IsInt()
  userId: number;
}
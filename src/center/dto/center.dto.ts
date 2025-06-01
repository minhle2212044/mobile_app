import { ApiProperty } from '@nestjs/swagger';

export class TypeDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  points: number;

  @ApiProperty()
  isHazardous: boolean;
}

export class ContactDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  tel: string;
}

export class WorkingTimeDto {
  @ApiProperty()
  day: string;

  @ApiProperty()
  startTime: string; // ISO string

  @ApiProperty()
  endTime: string; // ISO string
}

export class CenterDetailDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  address: string;

  @ApiProperty()
  imageUrl: string | null;
  @ApiProperty({ type: [TypeDto] })
  materials: TypeDto[];

  @ApiProperty({ type: ContactDto })
  contact: ContactDto;

  @ApiProperty({ type: [WorkingTimeDto] })
  workingTimes: WorkingTimeDto[];
}

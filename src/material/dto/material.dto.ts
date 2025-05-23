import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateMaterialDto {
  @ApiProperty()
  category: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  instruction: string;

  @ApiProperty({
    type: [Object],
    example: [
      { name: 'PET bottle', points: 10, isHazardous: false },
      { name: 'Oil can', points: 20, isHazardous: true },
    ],
  })
  types: {
    name: string;
    points: number;
    isHazardous: boolean;
  }[];
}

export class UpdateMaterialDto extends PartialType(CreateMaterialDto) {}

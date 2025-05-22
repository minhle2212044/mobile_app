import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsPhoneNumber,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuthDto {
  @ApiProperty({
    description: 'Email of the user',
    example: 'example@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Password of the user',
    example: 'password123',
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: 'Full name of the user',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Phone number of the user',
    example: '+84912345678',
  })
  @IsPhoneNumber('VN')
  @IsNotEmpty()
  tel: string;

  @ApiPropertyOptional({
    description: 'Date of birth of the user',
    example: '1990-01-01',
  })
  @IsDateString()
  @IsOptional()
  dob?: string;

  @ApiPropertyOptional({
    description: 'Address of the user',
    example: '123 Main St',
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({
    description: 'Gender of the user',
    example: 'Male',
  })
  @IsString()
  @IsNotEmpty()
  gender: string;

  @ApiProperty({
    description: 'Role of the user',
    example: 'CUSTOMER',
    enum: ['CUSTOMER', 'COLLECTOR'],
  })
  @IsString()
  role: 'CUSTOMER' | 'COLLECTOR';

  @ApiPropertyOptional({
    description: 'License number (required for collectors)',
    example: '12345',
  })
  @IsString()
  @IsOptional()
  license?: string;

  @ApiPropertyOptional({
    description: 'Points (only for customers)',
    example: 0,
  })
  @IsOptional()
  points?: number;
}

export class RefreshTokenDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({type: String, description: "ID", required: true, default: "2212044"})
    id: number

    @IsNotEmpty()
    @IsString()
    @ApiProperty({type: String, description: "User email", required: true, default: ""})
    email: string
}
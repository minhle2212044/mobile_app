import {
    IsEmail,
    IsNotEmpty,
    IsString,
    IsOptional,
    IsPhoneNumber,
    IsDateString,
  } from 'class-validator';
  
  export class AuthDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;
  
    @IsString()
    @IsNotEmpty()
    password: string;
  
    @IsString()
    @IsNotEmpty()
    name: string;
  
    @IsPhoneNumber()
    @IsNotEmpty()
    sdt: string;  // Số điện thoại
  
    @IsDateString()
    @IsOptional()
    dob?: string;  // Ngày sinh, optional
  
    @IsString()
    @IsOptional()
    address?: string;  // Địa chỉ, optional
  }
  
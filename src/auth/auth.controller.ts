import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Query
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthDto, RefreshTokenDto } from './dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Sign up a new user' }) // Mô tả API
  @ApiResponse({
    status: 201,
    description: 'User registered successfully.',
    schema: {
      example: {
        message: 'User registered successfully',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Credentials taken.',
    schema: {
      example: {
        statusCode: 403,
        message: 'Credentials taken',
        error: 'Forbidden',
      },
    },
  })
  @ApiBody({
    description: 'User registration data',
    schema: {
      example: {
        email: 'example@example.com',
        password: 'password123',
        name: 'John Doe',
        tel: '123456789',
        dob: '1990-01-01',
        address: '123 Main St',
        gender: 'Male',
        role: 'CUSTOMER',
        license: '12345', // Optional for collectors
      },
    },
  })
  @Post('signup')
  signup(@Body() dto: AuthDto) {
    return this.authService.signup(dto);
  }

  @ApiOperation({ summary: 'Sign in an existing user' }) // Mô tả API
  @ApiResponse({
    status: 200,
    description: 'Login successful.',
    schema: {
      example: {
        message: 'Login successful',
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: 1,
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Credentials incorrect.',
    schema: {
      example: {
        statusCode: 403,
        message: 'Credentials incorrect',
        error: 'Forbidden',
      },
    },
  })
  @ApiBody({
    description: 'User login data',
    schema: {
      example: {
        email: 'example@example.com',
        password: 'password123',
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  @Post('signin')
  signin(@Body() dto: AuthDto) {
    return this.authService.signin(dto);
  }

  @ApiOperation({ summary: "This is the API for refresh token getting" })
  @ApiBody({ type: RefreshTokenDto, required: true })
  @HttpCode(HttpStatus.OK)
  @Post('refresh-token')
  async refreshToken(@Body() dto: RefreshTokenDto) {
      return await this.authService.refreshToken(dto.id, dto.email)
  }

  @ApiOperation({ summary: "This is the API for access token resigning" })
  @Post('resign-access-token')
  @ApiQuery({ name: "refresh_token", type: String, required: true, description: "Refresh token" })
  async reSignAccessToken(@Query('refresh_token') refresh_token: string) {
      return await this.authService.reSignAccessToken(refresh_token)
  }
}

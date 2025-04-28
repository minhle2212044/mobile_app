import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Put,
    Delete,
    ParseIntPipe,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { JwtGuard } from '../auth/guard';
import { User } from '@prisma/client';

@ApiTags('Users') // Gắn tag cho nhóm API
@ApiBearerAuth() // Thêm Bearer Token cho tất cả các API trong controller
@UseGuards(JwtGuard)
@Controller('api/v1/users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @ApiOperation({ summary: 'Get all users' })
    @ApiResponse({
        status: 200,
        description: 'List of all users',
        schema: {
            example: [
                {
                    id: 1,
                    name: "Test User",
                    address: "123 Đường ABC, TP.HCM",
                    dob: "2000-01-01T00:00:00.000Z",
                    gender: "Male",
                    email: "test@gmail.com",
                    tel: "0912345678",
                    password: "$argon2id$v=19$m=65536,t=3,p=4$+P/g3w4Nx3ZAxanZP9KTXw$b22bsksaIcn6cH21AoGrnaowakt5jkDodTvTWokLTTw",
                    role: "CUSTOMER"
                },
            ],
        },
    })
    @Get()
    @HttpCode(HttpStatus.OK)
    findAll() {
        return this.userService.findAll();
    }

    @ApiOperation({ summary: 'Get a user by ID' })
    @ApiParam({ name: 'id', description: 'User ID', example: 1 })
    @ApiResponse({
        status: 200,
        description: 'User details',
        schema: {
          example: [
            {
                id: 1,
                name: "Test User",
                address: "123 Đường ABC, TP.HCM",
                dob: "2000-01-01T00:00:00.000Z",
                gender: "Male",
                email: "test@gmail.com",
                tel: "0912345678",
                password: "$argon2id$v=19$m=65536,t=3,p=4$+P/g3w4Nx3ZAxanZP9KTXw$b22bsksaIcn6cH21AoGrnaowakt5jkDodTvTWokLTTw",
                role: "CUSTOMER"
            },
        ],
        },
    })
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.userService.findOne(id);
    }

    @ApiOperation({ summary: 'Update a user by ID' })
    @ApiParam({ name: 'id', description: 'User ID', example: 1 })
    @ApiBody({
        description: 'User data to update',
        schema: {
            example: {
                name: 'John Doe Updated',
                tel: '987654321',
            },
        },
    })
    @ApiResponse({
        status: 200,
        description: 'Updated user details',
        schema: {
          example: [
            {
                id: 1,
                name: "Test User",
                address: "123 Đường ABC, TP.HCM",
                dob: "2000-01-01T00:00:00.000Z",
                gender: "Male",
                email: "test@gmail.com",
                tel: "0912345678",
                password: "$argon2id$v=19$m=65536,t=3,p=4$+P/g3w4Nx3ZAxanZP9KTXw$b22bsksaIcn6cH21AoGrnaowakt5jkDodTvTWokLTTw",
                role: "CUSTOMER"
            },
        ],
        },
    })
    @Put(':id')
    @HttpCode(HttpStatus.OK)
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: Partial<User>,
    ) {
        return this.userService.update(id, body);
    }

    @ApiOperation({ summary: 'Delete a user by ID' })
    @ApiParam({ name: 'id', description: 'User ID', example: 1 })
    @ApiResponse({
        status: 204,
        description: 'User deleted successfully',
    })
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.userService.remove(id);
    }

    @ApiOperation({ summary: 'Find a user by email' })
    @ApiParam({ name: 'email', description: 'User email', example: 'example@example.com' })
    @ApiResponse({
        status: 200,
        description: 'User details',
        schema: {
          example: [
            {
                id: 1,
                name: "Test User",
                address: "123 Đường ABC, TP.HCM",
                dob: "2000-01-01T00:00:00.000Z",
                gender: "Male",
                email: "test@gmail.com",
                tel: "0912345678",
                password: "$argon2id$v=19$m=65536,t=3,p=4$+P/g3w4Nx3ZAxanZP9KTXw$b22bsksaIcn6cH21AoGrnaowakt5jkDodTvTWokLTTw",
                role: "CUSTOMER"
            },
        ],
        },
    })
    @Get('email/:email')
    @HttpCode(HttpStatus.OK)
    findByEmail(@Param('email') email: string) {
        return this.userService.findByEmail(email);
    }

    @ApiOperation({ summary: 'Update user password' })
    @ApiParam({ name: 'id', description: 'User ID', example: 1 })
    @ApiBody({
        description: 'New password for the user',
        schema: {
            example: {
                newPassword: 'newPassword123',
            },
        },
    })
    @ApiResponse({
        status: 200,
        description: 'Password updated successfully',
        schema: {
            example: {
                id: 1,
                message: 'Password updated successfully',
            },
        },
    })
    @Put(':id/password')
    @HttpCode(HttpStatus.OK)
    updatePassword(
        @Param('id', ParseIntPipe) id: number,
        @Body('newPassword') newPassword: string,
    ) {
        return this.userService.updatePassword(id, newPassword);
    }
}
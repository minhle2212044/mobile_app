import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  ParseIntPipe
} from '@nestjs/common';
import { ApiOperation, ApiTags, ApiQuery } from '@nestjs/swagger';
import { OrderService } from './order.service';
import {
  CreateMaterialOrderDto,
  CreateRewardOrderDto,
} from './dto';

@ApiTags('orders')
@Controller('api/v1/orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('material')
  @ApiOperation({ summary: 'Tạo đơn hàng thu gom vật liệu' })
  createMaterialOrder(@Body() dto: CreateMaterialOrderDto) {
    return this.orderService.createMaterialOrder(dto);
  }

  @Post('reward/:id')
  @ApiOperation({ summary: 'Tạo đơn hàng đổi quà' })
  createRewardOrder(@Param('id') id: string) {
    return this.orderService.createRewardOrder(Number(id));
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách đơn hàng (có phân trang)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getAllOrders(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.orderService.getAllOrders({ page, limit });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết đơn hàng theo ID' })
  getOrderById(@Param('id') id: string) {
    return this.orderService.getOrderById(Number(id));
  }

  @Get('reward/:id')
  @ApiOperation({ summary: 'Lấy danh sách đơn đổi thưởng theo user và trạng thái' })
  getRewardOrders(
    @Param('id') userId: string,
    @Query('status') status: string = 'pending',
  ) {
    return this.orderService.getRewardOrders(Number(userId), status);
  }
  @Get('reward/:id/detail')
  async getRewardOrderDetail(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.getRewardOrderDetail(id);
  }
}

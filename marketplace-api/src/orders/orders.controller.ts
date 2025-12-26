import { Controller, Post, Get, Patch, Param, Body } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrderStatus } from './schemas/order.schema';
import { MongoObjectIdPipe } from 'src/common/pipes/mongo-objectId-pipe.pipe';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body('storeId') storeId: string) {
    return this.ordersService.create(storeId);
  }

  @Get(':id')
  findById(@Param('id', MongoObjectIdPipe) id: string) {
    return this.ordersService.findById(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', MongoObjectIdPipe) id: string,
    @Body('status') status: OrderStatus,
  ) {
    return this.ordersService.updateStatus(id, status);
  }
}

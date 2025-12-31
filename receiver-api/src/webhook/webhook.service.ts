import { Injectable } from '@nestjs/common';
import { OrderEventDto } from './dtos/order.event.dto';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { InjectModel } from '@nestjs/mongoose';
import { OrderEventDocument, OrderEvent } from './schemas/order-event.schema';
import { Model } from 'mongoose';

@Injectable()
export class WebhookService {
  constructor(
    private readonly httpService: HttpService,
    @InjectModel(OrderEvent.name)
    private readonly orderEventModel: Model<OrderEventDocument>,
  ) {}

  async findAll() {
    return this.orderEventModel.find().lean();
  }

  async handleEvent(event: OrderEventDto) {
    try {
      const order = await this.fetchOrder(event.orderId);
      await this.saveEvent(event, order);
    } catch (err) {
      if (err.code === 11000) {
        // Duplicate key error code
        return;
      }
      throw err;
    }
  }

  private async fetchOrder(orderId: string) {
    const { data } = await firstValueFrom(
      this.httpService.get(`http://marketplace-api:3000/orders/${orderId}`),
    );

    return data;
  }

  private async saveEvent(event: OrderEventDto, orderSnapshot: any) {
    const orderEvent = new this.orderEventModel({
      ...event,
      orderSnapshot,
    });

    return orderEvent.save();
  }
}

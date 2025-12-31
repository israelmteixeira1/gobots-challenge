import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { Model } from 'mongoose';
import { OrderStatus } from './enums/order-status.enum';
import { WebhookService } from 'src/webhook/webhook.service';
import { orderStatusToEvent } from './utils/order-status-to-event.util';
import { canTransitionStatus } from './utils/order-status-transition.util';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    private readonly webhookService: WebhookService,
  ) {}

  async create(storeId: string): Promise<Order> {
    const order = new this.orderModel({
      storeId,
      status: OrderStatus.CREATED,
    });

    const createdOrder = await order.save();

    setImmediate(() => {
      this.webhookService.notifyOrderEvent(
        orderStatusToEvent(OrderStatus.CREATED),
        createdOrder._id.toString(),
        storeId,
      );
    });

    return createdOrder;
  }

  async findById(id: string): Promise<Order> {
    const order = await this.orderModel.findById(id);

    if (!order) {
      throw new NotFoundException();
    }

    return order;
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const order = await this.orderModel.findById(id);

    if (!order) {
      throw new NotFoundException();
    }

    if (!canTransitionStatus(order.status, status)) {
      throw new BadRequestException(
        `Não é permitido alterar o status do pedido de ${order.status} para ${status}`,
      );
    }

    order.status = status;
    await order.save();

    setImmediate(() => {
      this.webhookService.notifyOrderEvent(
        orderStatusToEvent(status),
        order._id.toString(),
        order.storeId,
      );
    });

    return order;
  }
}

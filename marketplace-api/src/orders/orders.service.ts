import {
  BadRequestException,
  Injectable,
  Logger,
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
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    private readonly webhookService: WebhookService,
  ) {}

  async create(storeId: string): Promise<Order> {
    this.logger.log(`Criando pedido para a loja ${storeId}`);

    const order = new this.orderModel({
      storeId,
      status: OrderStatus.CREATED,
    });

    const createdOrder = await order.save();

    this.logger.log(
      `Pedido ${createdOrder._id.toString()} criado com status ${createdOrder.status}`,
    );

    setImmediate(() => {
      this.logger.log(
        `Disparando evento ${orderStatusToEvent(
          OrderStatus.CREATED,
        )} para o pedido ${createdOrder._id.toString()}`,
      );

      this.webhookService.notifyOrderEvent(
        orderStatusToEvent(OrderStatus.CREATED),
        createdOrder._id.toString(),
        storeId,
      );
    });

    return createdOrder;
  }

  async findById(id: string): Promise<Order> {
    this.logger.log(`Buscando pedido ${id}`);

    const order = await this.orderModel.findById(id);

    if (!order) {
      this.logger.warn(`Pedido ${id} não encontrado`);
      throw new NotFoundException();
    }

    return order;
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    this.logger.log(`Atualizando status do pedido ${id} para ${status}`);

    const order = await this.orderModel.findById(id);

    if (!order) {
      this.logger.warn(`Pedido ${id} não encontrado`);
      throw new NotFoundException();
    }

    if (!canTransitionStatus(order.status, status)) {
      this.logger.warn(
        `Transição de status inválida para o pedido ${id}: ${order.status} -> ${status}`,
      );

      throw new BadRequestException(
        `Não é permitido alterar o status do pedido de ${order.status} para ${status}`,
      );
    }

    order.status = status;
    await order.save();

    this.logger.log(`Status do pedido ${id} atualizado para ${status}`);

    setImmediate(() => {
      this.logger.log(
        `Disparando evento ${orderStatusToEvent(status)} para o pedido ${id}`,
      );

      this.webhookService.notifyOrderEvent(
        orderStatusToEvent(status),
        order._id.toString(),
        order.storeId,
      );
    });

    return order;
  }
}

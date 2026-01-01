import { Injectable, Logger } from '@nestjs/common';
import { OrderEventDto } from './dtos/order.event.dto';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { InjectModel } from '@nestjs/mongoose';
import { OrderEventDocument, OrderEvent } from './schemas/order-event.schema';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);
  private readonly marketplaceBaseUrl: string;
  constructor(
    private readonly httpService: HttpService,
    @InjectModel(OrderEvent.name)
    private readonly orderEventModel: Model<OrderEventDocument>,
    private readonly configService: ConfigService,
  ) {
    this.marketplaceBaseUrl = this.configService.getOrThrow<string>(
      'MARKETPLACE_BASE_URL',
    );
  }

  async findAll() {
    this.logger.log('Buscando todos os eventos de pedido armazenados');
    return this.orderEventModel.find().lean();
  }

  async handleEvent(event: OrderEventDto) {
    this.logger.log(
      `Processando evento do pedido ${event.orderId} do tipo ${event.event}`,
    );

    try {
      const order = await this.fetchOrder(event.orderId);
      await this.saveEvent(event, order);

      this.logger.log(`Evento do pedido ${event.orderId} salvo com sucesso`);
    } catch (err: any) {
      if (err?.code === 11000) {
        this.logger.warn(
          `Evento duplicado ignorado para o pedido ${event.orderId}`,
        );
        return;
      }

      this.logger.error(
        `Erro ao processar evento do pedido ${event.orderId}`,
        err?.stack,
      );

      throw err;
    }
  }

  private async fetchOrder(orderId: string) {
    this.logger.log(`Buscando dados do pedido ${orderId} no marketplace`);

    const { data } = await firstValueFrom(
      this.httpService.get(`${this.marketplaceBaseUrl}/orders/${orderId}`),
    );

    this.logger.log(`Dados do pedido ${orderId} obtidos com sucesso`);

    return data;
  }

  private async saveEvent(event: OrderEventDto, orderSnapshot: any) {
    this.logger.log(
      `Persistindo evento ${event.event} do pedido ${event.orderId}`,
    );

    const orderEvent = new this.orderEventModel({
      ...event,
      orderSnapshot,
    });

    return orderEvent.save();
  }
}

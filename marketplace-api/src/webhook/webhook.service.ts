import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { WebhookConfig } from './schemas/webhook-config.schema';
import { Model } from 'mongoose';
import { CreateWebhookConfigDto } from './dtos/create-webhook-config.dto';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { OrderEvent } from 'src/webhook/enums/order-event.enum';
import { OrderEventDto } from './dtos/order.event.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    @InjectModel(WebhookConfig.name)
    private readonly webhookConfigModel: Model<WebhookConfig>,
    private readonly httpService: HttpService,
  ) {}

  async create(config: CreateWebhookConfigDto): Promise<WebhookConfig> {
    this.logger.log(
      `Registrando webhook para as lojas: ${config.storeIds.join(', ')}`,
    );

    const webhookConfig = new this.webhookConfigModel(config);
    return webhookConfig.save();
  }

  async notifyOrderEvent(event: OrderEvent, orderId: string, storeId: string) {
    this.logger.log(
      `Notificando evento ${event} do pedido ${orderId} para a loja ${storeId}`,
    );

    const webhooks = await this.findByStoreId(storeId);

    if (!webhooks.length) {
      this.logger.warn(`Nenhum webhook configurado para a loja ${storeId}`);
      return;
    }

    const payload: OrderEventDto = {
      eventId: randomUUID(),
      event,
      orderId,
      storeId,
      timestamp: new Date().toISOString(),
    };

    for (const webhook of webhooks) {
      this.logger.log(`Enviando evento ${event} para ${webhook.callbackUrl}`);

      try {
        await this.sendWithRetry(webhook.callbackUrl, payload);
        this.logger.log(
          `Evento ${event} enviado com sucesso para ${webhook.callbackUrl}`,
        );
      } catch (error: any) {
        this.logger.error(
          `Falha definitiva no envio do webhook para ${webhook.callbackUrl}`,
          error?.stack,
        );
      }
    }
  }

  private async findByStoreId(storeId: string): Promise<WebhookConfig[]> {
    return this.webhookConfigModel.find({ storeIds: storeId }).exec();
  }

  private async sendWithRetry(
    url: string,
    payload: OrderEventDto,
    attempts = 3,
    delaySeconds = 3,
  ): Promise<void> {
    try {
      await firstValueFrom(this.httpService.post(url, payload));
    } catch (error) {
      this.logger.warn(
        `Falha ao enviar webhook para ${url}. Tentativas restantes: ${
          attempts - 1
        }`,
      );

      if (attempts <= 1) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, delaySeconds * 1000));

      return this.sendWithRetry(url, payload, attempts - 1, delaySeconds);
    }
  }
}

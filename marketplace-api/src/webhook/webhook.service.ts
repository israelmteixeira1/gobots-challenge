import { Injectable } from '@nestjs/common';
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
  constructor(
    @InjectModel(WebhookConfig.name)
    private readonly webhookConfigModel: Model<WebhookConfig>,
    private readonly httpService: HttpService,
  ) {}

  async create(config: CreateWebhookConfigDto): Promise<WebhookConfig> {
    const webhookConfig = new this.webhookConfigModel(config);
    return webhookConfig.save();
  }

  async notifyOrderEvent(event: OrderEvent, orderId: string, storeId: string) {
    const webhooks = await this.findByStoreId(storeId);

    if (!webhooks.length) {
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
      try {
        await this.sendWithRetry(webhook.callbackUrl, payload);
      } catch (error) {
        console.error(
          `Falha definitiva no envio do webhook para ${webhook.callbackUrl}`,
          error?.message,
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
      if (attempts <= 1) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, delaySeconds * 1000));

      return this.sendWithRetry(
        url,
        payload,
        attempts - 1,
        delaySeconds * 1000,
      );
    }
  }
}

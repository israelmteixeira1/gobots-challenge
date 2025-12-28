import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { WebhookConfig } from './schemas/webhook-config.schema';
import { Model } from 'mongoose';
import { CreateWebhookConfigDto } from './dtos/create-webhook-config.dto';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { OrderEvent } from 'src/webhook/enums/order-event.enum';
import { OrderEventDto } from './dtos/order.event.dto';

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
      event,
      orderId,
      storeId,
      timestamp: new Date().toISOString(),
    };

    for (const webhook of webhooks) {
      try {
        await firstValueFrom(
          this.httpService.post(webhook.callbackUrl, payload),
        );
      } catch (error) {
        console.error(
          `Falha no envio do webhook para ${webhook.callbackUrl}`,
          error?.message,
        );
      }
    }
  }

  private async findByStoreId(storeId: string): Promise<WebhookConfig[]> {
    return this.webhookConfigModel.find({ storeIds: storeId }).exec();
  }
}

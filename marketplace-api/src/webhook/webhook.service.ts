import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { WebhookConfig } from './schemas/webhook-config.schema';
import { Model } from 'mongoose';
import { CreateWebhookConfigDto } from './dtos/create-webhook-config.dto';

@Injectable()
export class WebhookService {
  constructor(
    @InjectModel(WebhookConfig.name)
    private readonly webhookConfigModel: Model<WebhookConfig>,
  ) {}

  async create(config: CreateWebhookConfigDto): Promise<WebhookConfig> {
    const webhookConfig = new this.webhookConfigModel(config);
    return webhookConfig.save();
  }

  async findByStoreId(storeId: string): Promise<WebhookConfig[]> {
    return this.webhookConfigModel.find({ storeIds: storeId }).exec();
  }
}

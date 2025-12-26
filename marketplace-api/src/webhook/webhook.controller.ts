import { Body, Controller, Post } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { CreateWebhookConfigDto } from './dtos/create-webhook-config.dto';

@Controller('webhooks')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post()
  create(@Body() createWebhookDto: CreateWebhookConfigDto) {
    return this.webhookService.create(createWebhookDto);
  }
}

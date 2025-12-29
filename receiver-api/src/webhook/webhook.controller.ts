import { Body, Controller, Post } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { OrderEventDto } from './dtos/order.event.dto';

@Controller()
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('/webhook/orders')
  async handleOrderEvent(@Body() payload: OrderEventDto) {
    return this.webhookService.handleEvent(payload);
  }
}

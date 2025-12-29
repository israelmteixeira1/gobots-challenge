import { Module } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { WebhookController } from './webhook.controller';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderEvent, OrderEventSchema } from './schemas/order-event.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OrderEvent.name, schema: OrderEventSchema },
    ]),
    HttpModule,
  ],
  controllers: [WebhookController],
  providers: [WebhookService],
})
export class WebhookModule {}

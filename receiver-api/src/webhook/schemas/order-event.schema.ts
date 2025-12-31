import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { OrderEvent as OrderEventEnum } from '../enums/order-event.enum';

export type OrderEventDocument = OrderEvent & Document;

@Schema({ timestamps: true })
export class OrderEvent {
  @Prop({ required: true, unique: true, index: true })
  eventId: string;

  @Prop({ required: true, enum: OrderEventEnum })
  event: OrderEventEnum;

  @Prop({ required: true, index: true })
  orderId: string;

  @Prop({ required: true, index: true })
  storeId: string;

  @Prop({ required: true })
  timestamp: string;

  @Prop({ type: Object, required: true })
  orderSnapshot: Record<string, unknown>;
}

export const OrderEventSchema = SchemaFactory.createForClass(OrderEvent);

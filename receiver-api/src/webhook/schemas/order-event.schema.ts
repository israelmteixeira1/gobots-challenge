import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { OrderEventDto } from '../dtos/order.event.dto';

export type OrderEventDocument = OrderEvent & Document;

@Schema({ timestamps: true })
export class OrderEvent {
  @Prop({ type: Object, required: true })
  event: OrderEventDto;

  @Prop({ type: Object, required: true })
  orderSnapshot: Record<string, unknown>;
}

export const OrderEventSchema = SchemaFactory.createForClass(OrderEvent);

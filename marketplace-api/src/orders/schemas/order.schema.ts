import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { OrderStatus } from '../enums/order-status.enum';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true })
  storeId: string;

  @Prop({
    required: true,
    enum: OrderStatus,
    default: OrderStatus.CREATED,
  })
  status: OrderStatus;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

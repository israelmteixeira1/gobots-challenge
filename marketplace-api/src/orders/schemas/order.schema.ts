import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OrderDocument = Order & Document;

export enum OrderStatus {
  CREATED = 'CREATED',
  PAID = 'PAID',
  SHIPPED = 'SHIPPED',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED',
}

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

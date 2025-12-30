import { OrderEvent } from '../enums/order-event.enum';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class OrderEventDto {
  @IsString()
  @IsNotEmpty()
  eventId: string;

  @IsEnum(OrderEvent)
  event: OrderEvent;

  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsString()
  @IsNotEmpty()
  storeId: string;

  @IsString()
  timestamp: string;
}

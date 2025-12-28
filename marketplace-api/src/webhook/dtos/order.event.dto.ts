import { OrderEvent } from '../enums/order-event.enum';

export class OrderEventDto {
  event: OrderEvent;
  orderId: string;
  storeId: string;
  timestamp: string;
}

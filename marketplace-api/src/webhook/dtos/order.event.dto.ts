import { OrderEvent } from '../enums/order-event.enum';

export class OrderEventDto {
  eventId: string;
  event: OrderEvent;
  orderId: string;
  storeId: string;
  timestamp: string;
}

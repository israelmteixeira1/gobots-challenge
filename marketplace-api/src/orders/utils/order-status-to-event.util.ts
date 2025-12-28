import { OrderStatus } from '../enums/order-status.enum';
import { OrderEvent } from '../../webhook/enums/order-event.enum';

export const ORDER_STATUS_EVENT_MAP: Record<OrderStatus, OrderEvent> = {
  [OrderStatus.CREATED]: OrderEvent.CREATED,
  [OrderStatus.PAID]: OrderEvent.PAID,
  [OrderStatus.SHIPPED]: OrderEvent.SHIPPED,
  [OrderStatus.COMPLETED]: OrderEvent.COMPLETED,
  [OrderStatus.CANCELED]: OrderEvent.CANCELED,
};

export function orderStatusToEvent(status: OrderStatus): OrderEvent {
  return ORDER_STATUS_EVENT_MAP[status];
}

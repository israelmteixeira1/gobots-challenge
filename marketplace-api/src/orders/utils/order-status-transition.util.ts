import { OrderStatus } from '../enums/order-status.enum';

export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.CREATED]: [OrderStatus.PAID, OrderStatus.CANCELED],
  [OrderStatus.PAID]: [OrderStatus.SHIPPED, OrderStatus.CANCELED],
  [OrderStatus.SHIPPED]: [OrderStatus.COMPLETED],
  [OrderStatus.COMPLETED]: [],
  [OrderStatus.CANCELED]: [],
};

export function canTransitionStatus(
  current: OrderStatus,
  next: OrderStatus,
): boolean {
  return ORDER_STATUS_TRANSITIONS[current]?.includes(next);
}

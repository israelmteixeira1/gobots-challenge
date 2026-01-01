import { OrderStatus } from '../enums/order-status.enum';
import { OrderEvent } from '../../webhook/enums/order-event.enum';
import { orderStatusToEvent } from './order-status-to-event.util';

describe('orderStatusToEvent', () => {
  it('deve mapear CREATED para OrderEvent.CREATED', () => {
    expect(orderStatusToEvent(OrderStatus.CREATED)).toBe(OrderEvent.CREATED);
  });

  it('deve mapear PAID para OrderEvent.PAID', () => {
    expect(orderStatusToEvent(OrderStatus.PAID)).toBe(OrderEvent.PAID);
  });

  it('deve mapear SHIPPED para OrderEvent.SHIPPED', () => {
    expect(orderStatusToEvent(OrderStatus.SHIPPED)).toBe(OrderEvent.SHIPPED);
  });

  it('deve mapear COMPLETED para OrderEvent.COMPLETED', () => {
    expect(orderStatusToEvent(OrderStatus.COMPLETED)).toBe(
      OrderEvent.COMPLETED,
    );
  });

  it('deve mapear CANCELED para OrderEvent.CANCELED', () => {
    expect(orderStatusToEvent(OrderStatus.CANCELED)).toBe(OrderEvent.CANCELED);
  });
});

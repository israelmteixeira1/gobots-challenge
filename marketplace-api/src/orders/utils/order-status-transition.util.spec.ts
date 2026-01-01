import { OrderStatus } from '../enums/order-status.enum';
import { canTransitionStatus } from './order-status-transition.util';

describe('canTransitionStatus', () => {
  describe('transições válidas', () => {
    it('deve permitir CREATED -> PAID', () => {
      expect(canTransitionStatus(OrderStatus.CREATED, OrderStatus.PAID)).toBe(
        true,
      );
    });

    it('deve permitir CREATED -> CANCELED', () => {
      expect(
        canTransitionStatus(OrderStatus.CREATED, OrderStatus.CANCELED),
      ).toBe(true);
    });

    it('deve permitir PAID -> SHIPPED', () => {
      expect(canTransitionStatus(OrderStatus.PAID, OrderStatus.SHIPPED)).toBe(
        true,
      );
    });

    it('deve permitir PAID -> CANCELED', () => {
      expect(canTransitionStatus(OrderStatus.PAID, OrderStatus.CANCELED)).toBe(
        true,
      );
    });

    it('deve permitir SHIPPED -> COMPLETED', () => {
      expect(
        canTransitionStatus(OrderStatus.SHIPPED, OrderStatus.COMPLETED),
      ).toBe(true);
    });
  });

  describe('transições inválidas', () => {
    it('não deve permitir CREATED -> SHIPPED', () => {
      expect(
        canTransitionStatus(OrderStatus.CREATED, OrderStatus.SHIPPED),
      ).toBe(false);
    });

    it('não deve permitir PAID -> CREATED', () => {
      expect(canTransitionStatus(OrderStatus.PAID, OrderStatus.CREATED)).toBe(
        false,
      );
    });

    it('não deve permitir SHIPPED -> PAID', () => {
      expect(canTransitionStatus(OrderStatus.SHIPPED, OrderStatus.PAID)).toBe(
        false,
      );
    });

    it('não deve permitir COMPLETED -> qualquer status', () => {
      expect(
        canTransitionStatus(OrderStatus.COMPLETED, OrderStatus.CREATED),
      ).toBe(false);

      expect(canTransitionStatus(OrderStatus.COMPLETED, OrderStatus.PAID)).toBe(
        false,
      );
    });

    it('não deve permitir CANCELED -> qualquer status', () => {
      expect(
        canTransitionStatus(OrderStatus.CANCELED, OrderStatus.CREATED),
      ).toBe(false);

      expect(canTransitionStatus(OrderStatus.CANCELED, OrderStatus.PAID)).toBe(
        false,
      );
    });
  });
});

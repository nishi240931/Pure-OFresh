import { adminOrderRepository } from '@/repositories/adminOrderRepository';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { db } from '@/lib/db';

export class AdminOrderService {
  async getAllOrders(params: {
    search?: string;
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    page: number;
    limit: number;
    sort: 'newest' | 'oldest' | 'highest_amount' | 'lowest_amount';
  }) {
    return adminOrderRepository.listOrders(params);
  }

  async getOrderDetails(id: string) {
    const order = await adminOrderRepository.getOrderById(id);
    if (!order) {
      throw new Error('Order not found.');
    }
    return order;
  }

  async updateOrderStatus(id: string, targetStatus: OrderStatus) {
    const order = await adminOrderRepository.getOrderById(id);
    if (!order) {
      throw new Error('Order not found.');
    }

    const currentStatus = order.orderStatus;

    // Transition Validation Rules
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      PENDING: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      CONFIRMED: [OrderStatus.PACKED, OrderStatus.CANCELLED],
      PACKED: [OrderStatus.OUT_FOR_DELIVERY],
      OUT_FOR_DELIVERY: [OrderStatus.DELIVERED],
      DELIVERED: [],
      CANCELLED: [],
    };

    const allowed = validTransitions[currentStatus] || [];
    if (!allowed.includes(targetStatus)) {
      throw new Error(`Invalid status transition from ${currentStatus} to ${targetStatus}.`);
    }

    // Run in a transaction to handle product stock replenishment if cancelled
    return db.$transaction(async (tx) => {
      if (targetStatus === OrderStatus.CANCELLED) {
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }
      return adminOrderRepository.updateOrderStatus(id, targetStatus, tx);
    });
  }

  async updatePaymentStatus(id: string, paymentStatus: PaymentStatus) {
    const order = await adminOrderRepository.getOrderById(id);
    if (!order) {
      throw new Error('Order not found.');
    }

    // Business validation: Payment status updates
    if (paymentStatus === PaymentStatus.REFUNDED && order.paymentStatus !== PaymentStatus.PAID) {
      throw new Error('Cannot refund an unpaid order.');
    }

    return adminOrderRepository.updatePaymentStatus(id, paymentStatus);
  }
}

export const adminOrderService = new AdminOrderService();

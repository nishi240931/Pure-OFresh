import { db } from '@/lib/db';
import { orderRepository } from '@/repositories/orderRepository';
import { cartRepository } from '@/repositories/cartRepository';
import { checkoutService } from '@/services/checkoutService';
import { OrderStatus, PaymentStatus, PaymentMethod } from '@prisma/client';

export class OrderService {
  async createOrderFromCheckout(userId: string, data: {
    addressId: string;
    paymentMethod: PaymentMethod;
    deliverySlot?: string | null;
    notes?: string | null;
  }) {
    // 1. Validate the checkout on latest prices and stock levels
    const checkoutResult = await checkoutService.validateCheckout(userId, data.addressId);
    if (!checkoutResult.success) {
      return {
        success: false,
        message: checkoutResult.message,
        error: 'CHECKOUT_VALIDATION_FAILED',
        details: (checkoutResult as any).unavailableItems || null,
      };
    }

    // 2. Fetch latest cart and products
    const cart: any = await cartRepository.getCartByUserId(userId);
    if (!cart || !cart.items || cart.items.length === 0) {
      return {
        success: false,
        message: 'Cart is empty.',
        error: 'EMPTY_CART',
      };
    }

    // 3. Generate unique order number (e.g. POF20260714XXXX)
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`;
    const rand = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `POF${dateStr}${rand}`;

    // 4. Run database operations in a transaction
    try {
      const order = await db.$transaction(async (tx) => {
        const items = [];

        // Deduct stock and build item snapshots
        for (const item of cart.items) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
          });

          if (!product) {
            throw new Error(`Product ${item.product.name} no longer exists.`);
          }

          if (product.stock < item.quantity) {
            throw new Error(`Insufficient stock for ${product.name}. Only ${product.stock} items left.`);
          }

          // Deduct inventory
          await tx.product.update({
            where: { id: product.id },
            data: { stock: { decrement: item.quantity } },
          });

          const currentActivePrice = product.discountPrice !== null && product.discountPrice !== undefined
            ? product.discountPrice
            : product.price;

          items.push({
            productId: product.id,
            productName: product.name,
            productImage: product.image,
            quantity: item.quantity,
            unitPrice: currentActivePrice,
            totalPrice: currentActivePrice * item.quantity,
          });
        }

        const checkoutData = (checkoutResult as any).data;

        // Create Order and OrderItems
        const newOrder = await orderRepository.createOrder({
          orderNumber,
          userId,
          addressId: data.addressId,
          subtotal: checkoutData.summary.subtotal,
          discount: checkoutData.summary.discount,
          couponDiscount: 0,
          deliveryFee: checkoutData.summary.deliveryFee,
          gst: checkoutData.summary.gst,
          grandTotal: checkoutData.summary.grandTotal,
          paymentMethod: data.paymentMethod,
          deliverySlot: data.deliverySlot,
          notes: data.notes,
        }, items, tx);

        // Clear user's cart items only if paying via COD. For Razorpay, we clear it upon successful verification.
        if (data.paymentMethod === PaymentMethod.COD) {
          await tx.cartItem.deleteMany({
            where: { cartId: cart.id },
          });
        }

        // If paying via COD, mark orderStatus as CONFIRMED. If RAZORPAY, keep both as PENDING until payment is verified.
        if (data.paymentMethod === PaymentMethod.COD) {
          await orderRepository.updateOrderStatus(newOrder.id, OrderStatus.CONFIRMED, tx);
          newOrder.orderStatus = OrderStatus.CONFIRMED;
        }

        return newOrder;
      });

      return {
        success: true,
        message: 'Order created successfully',
        data: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          status: order.orderStatus,
        },
      };
    } catch (err: any) {
      console.error('Order creation transaction failed:', err);
      return {
        success: false,
        message: err.message || 'Unable to create order',
        error: 'ORDER_CREATION_FAILED',
      };
    }
  }

  async getOrderDetails(userId: string, orderId: string) {
    const order = await orderRepository.getOrderById(orderId);
    if (!order) {
      throw new Error('Order not found.');
    }
    if (order.userId !== userId) {
      throw new Error('Unauthorized access to order details.');
    }
    return order;
  }

  async cancelOrder(userId: string, orderId: string) {
    const order = await orderRepository.getOrderById(orderId);
    if (!order) {
      throw new Error('Order not found.');
    }
    if (order.userId !== userId) {
      throw new Error('Unauthorized access to order.');
    }

    // Enforce cancellation rules
    const allowed: OrderStatus[] = [OrderStatus.PENDING, OrderStatus.CONFIRMED];
    if (!allowed.includes(order.orderStatus)) {
      throw new Error(`Cancellation not allowed for order status: ${order.orderStatus}`);
    }

    try {
      return await db.$transaction(async (tx) => {
        // Restore stock
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }

        // Set status to CANCELLED
        return orderRepository.cancelOrder(order.id, tx);
      });
    } catch (err: any) {
      console.error('Order cancellation transaction failed:', err);
      throw new Error(err.message || 'Failed to cancel order.');
    }
  }

  async updateOrderStatusByAdmin(orderId: string, targetStatus: OrderStatus) {
    const order = await orderRepository.getOrderById(orderId);
    if (!order) {
      throw new Error('Order not found.');
    }

    // Transition Validation Rules
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      PENDING: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      CONFIRMED: [OrderStatus.PACKED, OrderStatus.CANCELLED],
      PACKED: [OrderStatus.OUT_FOR_DELIVERY],
      OUT_FOR_DELIVERY: [OrderStatus.DELIVERED],
      DELIVERED: [],
      CANCELLED: [],
    };

    const currentStatus = order.orderStatus;
    const allowed = validTransitions[currentStatus] || [];
    if (!allowed.includes(targetStatus)) {
      throw new Error(`Invalid status transition from ${currentStatus} to ${targetStatus}.`);
    }

    try {
      return await db.$transaction(async (tx) => {
        // If canceling, restore product inventory
        if (targetStatus === OrderStatus.CANCELLED) {
          for (const item of order.items) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            });
          }
        }
        return orderRepository.updateOrderStatus(order.id, targetStatus, tx);
      });
    } catch (err: any) {
      console.error('Admin status update transaction failed:', err);
      throw new Error(err.message || 'Failed to update order status.');
    }
  }
}

export const orderService = new OrderService();

import { db } from '@/lib/db';
import { OrderStatus, PaymentStatus, PaymentMethod } from '@prisma/client';

export class OrderRepository {
  async createOrder(data: {
    orderNumber: string;
    userId: string;
    addressId: string;
    subtotal: number;
    discount: number;
    couponDiscount?: number;
    deliveryFee: number;
    gst: number;
    grandTotal: number;
    paymentMethod: PaymentMethod;
    deliverySlot?: string | null;
    couponCode?: string | null;
    notes?: string | null;
  }, items: {
    productId: string;
    productName: string;
    productImage: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[], tx?: any) {
    const prisma = tx || db;

    return prisma.order.create({
      data: {
        orderNumber: data.orderNumber,
        userId: data.userId,
        addressId: data.addressId,
        subtotal: data.subtotal,
        discount: data.discount,
        couponDiscount: data.couponDiscount || 0,
        deliveryFee: data.deliveryFee,
        gst: data.gst,
        grandTotal: data.grandTotal,
        paymentStatus: 'PENDING',
        orderStatus: 'PENDING',
        paymentMethod: data.paymentMethod,
        deliverySlot: data.deliverySlot || null,
        couponCode: data.couponCode || null,
        notes: data.notes || null,
        items: {
          create: items.map(item => ({
            productId: item.productId,
            productName: item.productName,
            productImage: item.productImage,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
          })),
        },
      },
      include: {
        items: true,
        address: true,
      },
    });
  }

  async getOrderById(orderId: string) {
    return db.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        address: true,
      },
    });
  }

  async getOrdersByUser(userId: string, sort: 'newest' | 'oldest' = 'newest') {
    return db.order.findMany({
      where: { userId },
      orderBy: { createdAt: sort === 'newest' ? 'desc' : 'asc' },
      include: {
        items: true,
        address: true,
      },
    });
  }

  async updateOrderStatus(orderId: string, status: OrderStatus, tx?: any) {
    const prisma = tx || db;
    return prisma.order.update({
      where: { id: orderId },
      data: { orderStatus: status },
      include: {
        items: true,
        address: true,
      },
    });
  }

  async updatePaymentStatus(orderId: string, status: PaymentStatus, tx?: any) {
    const prisma = tx || db;
    return prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: status },
    });
  }

  async cancelOrder(orderId: string, tx?: any) {
    const prisma = tx || db;
    return prisma.order.update({
      where: { id: orderId },
      data: { orderStatus: 'CANCELLED' },
      include: {
        items: true,
        address: true,
      },
    });
  }
}

export const orderRepository = new OrderRepository();

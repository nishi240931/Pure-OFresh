import { db } from '@/lib/db';
import { PaymentStatus } from '@prisma/client';

export class PaymentRepository {
  async saveRazorpayOrderId(orderId: string, rpOrderId: string, tx?: any) {
    const prisma = tx || db;
    return prisma.order.update({
      where: { id: orderId },
      data: {
        razorpayOrderId: rpOrderId,
        paymentStatus: PaymentStatus.PROCESSING,
      },
    });
  }

  async saveRazorpayPaymentDetails(
    orderId: string,
    details: {
      rpPaymentId: string;
      rpSignature?: string;
      status: PaymentStatus;
      failureReason?: string | null;
      completedAt?: Date | null;
    },
    tx?: any
  ) {
    const prisma = tx || db;
    return prisma.order.update({
      where: { id: orderId },
      data: {
        razorpayPaymentId: details.rpPaymentId,
        razorpaySignature: details.rpSignature || null,
        paymentStatus: details.status,
        paymentFailureReason: details.failureReason || null,
        paymentCompletedAt: details.completedAt || null,
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

  async incrementPaymentAttempts(orderId: string, reason?: string | null, tx?: any) {
    const prisma = tx || db;
    return prisma.order.update({
      where: { id: orderId },
      data: {
        paymentAttempts: { increment: 1 },
        paymentFailureReason: reason || null,
        paymentStatus: PaymentStatus.FAILED,
      },
    });
  }

  async getPaymentDetailsByOrder(orderId: string) {
    return db.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        orderNumber: true,
        grandTotal: true,
        paymentStatus: true,
        paymentMethod: true,
        razorpayOrderId: true,
        razorpayPaymentId: true,
        razorpaySignature: true,
        paymentCompletedAt: true,
        paymentFailureReason: true,
        paymentAttempts: true,
        createdAt: true,
      },
    });
  }

  async getPaymentHistory() {
    return db.order.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        orderNumber: true,
        grandTotal: true,
        paymentStatus: true,
        paymentMethod: true,
        razorpayOrderId: true,
        razorpayPaymentId: true,
        paymentCompletedAt: true,
        paymentFailureReason: true,
        paymentAttempts: true,
        createdAt: true,
      },
    });
  }
}

export const paymentRepository = new PaymentRepository();

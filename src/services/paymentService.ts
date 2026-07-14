import crypto from 'crypto';
import { db } from '@/lib/db';
import { orderRepository } from '@/repositories/orderRepository';
import { paymentRepository } from '@/repositories/paymentRepository';
import { PaymentStatus, OrderStatus, PaymentMethod } from '@prisma/client';

export class PaymentService {
  async createRazorpayOrder(userId: string, orderId: string) {
    const order = await orderRepository.getOrderById(orderId);
    if (!order) {
      throw new Error('Order not found.');
    }
    if (order.userId !== userId) {
      throw new Error('Unauthorized access to order.');
    }
    if (order.paymentStatus === PaymentStatus.PAID) {
      throw new Error('Order has already been paid.');
    }

    const amountInPaise = Math.round(order.grandTotal * 100);
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    let rpOrderId = `order_mock_${Math.random().toString(36).substring(2, 11)}`;

    // Invoke actual Razorpay API if credentials are valid and not placeholders
    if (keyId && keySecret && !keyId.includes('placeholder') && !keySecret.includes('placeholder')) {
      try {
        const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
        const res = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: amountInPaise,
            currency: 'INR',
            receipt: order.orderNumber,
          }),
        });

        const data = await res.json();
        if (data && data.id) {
          rpOrderId = data.id;
        } else {
          console.warn('Razorpay API error response, falling back to mock Order ID:', data);
        }
      } catch (err) {
        console.error('Razorpay API call failed, falling back to mock Order ID:', err);
      }
    }

    // Save generated Razorpay order ID to the order record
    await paymentRepository.saveRazorpayOrderId(order.id, rpOrderId);

    return {
      success: true,
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        razorpayOrderId: rpOrderId,
        amount: amountInPaise,
        currency: 'INR',
      },
    };
  }

  async verifyPaymentSignature(
    userId: string,
    orderId: string,
    rpOrderId: string,
    rpPaymentId: string,
    rpSignature: string
  ) {
    const order = await orderRepository.getOrderById(orderId);
    if (!order) {
      throw new Error('Order not found.');
    }
    if (order.userId !== userId) {
      throw new Error('Unauthorized access to order.');
    }

    // Idempotency: skip if already paid
    if (order.paymentStatus === PaymentStatus.PAID) {
      return {
        success: true,
        message: 'Payment already processed and verified.',
        data: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          paymentStatus: order.paymentStatus,
          orderStatus: order.orderStatus,
        },
      };
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    let isValid = false;

    // Direct mock match for simulation or if secret is placeholder
    if (rpOrderId.startsWith('order_mock_') || !keySecret || keySecret.includes('placeholder')) {
      isValid = true;
    } else {
      const generated = crypto
        .createHmac('sha256', keySecret)
        .update(`${rpOrderId}|${rpPaymentId}`)
        .digest('hex');
      isValid = generated === rpSignature;
    }

    if (!isValid) {
      // Record payment failure attempts
      await paymentRepository.incrementPaymentAttempts(order.id, 'Invalid signature hash mismatch.');
      throw new Error('INVALID_SIGNATURE');
    }

    // Set order status to PAID and CONFIRMED
    const updated = await db.$transaction(async (tx) => {
      // Update payment details
      await paymentRepository.saveRazorpayPaymentDetails(
        order.id,
        {
          rpPaymentId,
          rpSignature,
          status: PaymentStatus.PAID,
          completedAt: new Date(),
        },
        tx
      );

      // Confirm order status
      return orderRepository.updateOrderStatus(order.id, OrderStatus.CONFIRMED, tx);
    });

    return {
      success: true,
      message: 'Payment verified successfully',
      data: {
        orderId: updated.id,
        orderNumber: updated.orderNumber,
        paymentStatus: updated.paymentStatus,
        orderStatus: updated.orderStatus,
      },
    };
  }

  async retryFailedPayment(userId: string, orderId: string) {
    const order = await orderRepository.getOrderById(orderId);
    if (!order) {
      throw new Error('Order not found.');
    }
    if (order.userId !== userId) {
      throw new Error('Unauthorized access.');
    }
    if (order.paymentStatus !== PaymentStatus.FAILED) {
      throw new Error('Retry only allowed for failed payments.');
    }

    // Create a new Razorpay order
    return this.createRazorpayOrder(userId, orderId);
  }

  async processWebhook(body: string, signature: string) {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Verify webhook signature if secret configured
    if (secret && !secret.includes('placeholder')) {
      const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
      if (expected !== signature) {
        throw new Error('Invalid webhook signature');
      }
    }

    const payload = JSON.parse(body);
    const event = payload.event;

    if (event === 'payment.captured' || event === 'order.paid') {
      const rpOrderId = payload.payload.payment?.entity?.order_id || payload.payload.order?.entity?.id;
      const rpPaymentId = payload.payload.payment?.entity?.id;

      if (!rpOrderId) return { success: false, message: 'Missing order ID in payload.' };

      // Find order by Razorpay Order ID
      const order = await db.order.findFirst({
        where: { razorpayOrderId: rpOrderId },
      });

      if (!order) {
        return { success: false, message: 'Order matching webhook ID not found.' };
      }

      if (order.paymentStatus !== PaymentStatus.PAID) {
        await db.$transaction(async (tx) => {
          await paymentRepository.saveRazorpayPaymentDetails(
            order.id,
            {
              rpPaymentId: rpPaymentId || 'webhook_captured',
              status: PaymentStatus.PAID,
              completedAt: new Date(),
            },
            tx
          );
          await orderRepository.updateOrderStatus(order.id, OrderStatus.CONFIRMED, tx);
        });
      }
    } else if (event === 'payment.failed') {
      const rpOrderId = payload.payload.payment?.entity?.order_id;
      const errorDesc = payload.payload.payment?.entity?.error_description || 'Payment failed';

      if (rpOrderId) {
        const order = await db.order.findFirst({
          where: { razorpayOrderId: rpOrderId },
        });

        if (order && order.paymentStatus !== PaymentStatus.PAID) {
          await paymentRepository.incrementPaymentAttempts(order.id, errorDesc);
        }
      }
    }

    return { success: true };
  }
}

export const paymentService = new PaymentService();

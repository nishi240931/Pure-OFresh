import { z } from 'zod';

export const createPaymentOrderSchema = z.object({
  orderId: z.string().uuid({ message: 'Invalid order ID format.' }),
});

export const verifyPaymentSchema = z.object({
  orderId: z.string().uuid({ message: 'Invalid order ID format.' }),
  razorpayOrderId: z.string().min(1, { message: 'Razorpay Order ID is required.' }),
  razorpayPaymentId: z.string().min(1, { message: 'Razorpay Payment ID is required.' }),
  razorpaySignature: z.string().min(1, { message: 'Razorpay Signature is required.' }),
});

export const retryPaymentSchema = z.object({
  orderId: z.string().uuid({ message: 'Invalid order ID format.' }),
});

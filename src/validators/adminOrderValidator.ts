import { z } from 'zod';
import { OrderStatus, PaymentStatus } from '@prisma/client';

export const adminOrderQuerySchema = z.object({
  search: z.string().optional(),
  status: z.preprocess((val) => (val === '' ? undefined : val), z.nativeEnum(OrderStatus).optional()),
  paymentStatus: z.preprocess((val) => (val === '' ? undefined : val), z.nativeEnum(PaymentStatus).optional()),
  page: z.preprocess((val) => Number(val) || 1, z.number().int().min(1)).default(1),
  limit: z.preprocess((val) => Number(val) || 8, z.number().int().min(1).max(100)).default(8),
  sort: z.enum(['newest', 'oldest', 'highest_amount', 'lowest_amount']).default('newest'),
});

export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});

export const updatePaymentStatusSchema = z.object({
  paymentStatus: z.nativeEnum(PaymentStatus),
});

export const adminNotesSchema = z.object({
  notes: z.string().max(500, { message: 'Notes cannot exceed 500 characters.' }).optional().nullable(),
});

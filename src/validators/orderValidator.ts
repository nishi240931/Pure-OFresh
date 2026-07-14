import { z } from 'zod';
import { OrderStatus, PaymentMethod } from '@prisma/client';

export const createOrderSchema = z.object({
  addressId: z.string().uuid('Invalid address ID format.'),
  paymentMethod: z.nativeEnum(PaymentMethod),
  deliverySlot: z.string().optional().nullable(),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters.').optional().nullable(),
});

export const orderIdSchema = z.object({
  id: z.string().uuid('Invalid order ID format.'),
});

export const updateStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});

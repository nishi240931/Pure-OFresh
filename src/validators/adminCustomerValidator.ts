import { z } from 'zod';

export const adminCustomerQuerySchema = z.object({
  search: z.string().optional(),
  page: z.preprocess((val) => Number(val) || 1, z.number().int().min(1)).default(1),
  limit: z.preprocess((val) => Number(val) || 8, z.number().int().min(1).max(100)).default(8),
  sort: z.enum(['newest', 'oldest', 'highest_spending', 'most_orders']).default('newest'),
});

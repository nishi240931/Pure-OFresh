import { z } from 'zod';

export const checkoutSchema = z.object({
  addressId: z.string().uuid('Invalid address ID (must be a valid UUID).'),
});

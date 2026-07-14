import { z } from 'zod';
import { AddressType } from '@prisma/client';

export const addressSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters.'),
  phone: z.string().regex(/^\+?[0-9\s\-()]{10,15}$/, 'Invalid phone number format.'),
  addressLine1: z.string().min(5, 'Address line 1 must be at least 5 characters.'),
  addressLine2: z.string().optional().nullable(),
  landmark: z.string().optional().nullable(),
  city: z.string().min(2, 'City name is too short.'),
  state: z.string().min(2, 'State name is too short.'),
  postalCode: z.string().regex(/^[1-9][0-9]{5}$/, 'Invalid Indian postal PIN code (must be 6 digits).'),
  country: z.string().default('India').optional(),
  addressType: z.nativeEnum(AddressType).default(AddressType.HOME),
  isDefault: z.boolean().default(false).optional(),
});

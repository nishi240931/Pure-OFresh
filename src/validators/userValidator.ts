import { z } from 'zod';

// Indian phone number regex match (10 digits, optional leading country code)
const phoneRegex = /^(?:\+91|91)?[6-9]\d{9}$/;

export const userProfileSchema = z.object({
  fullName: z
    .string()
    .min(2, { message: 'Full name must be at least 2 characters.' })
    .max(100, { message: 'Full name cannot exceed 100 characters.' }),
  email: z
    .string()
    .email({ message: 'Please enter a valid email address.' }),
  phone: z
    .string()
    .regex(phoneRegex, { message: 'Please enter a valid 10-digit Indian phone number.' })
    .nullable()
    .optional()
    .or(z.literal('')),
});

export type UserProfileInput = z.infer<typeof userProfileSchema>;

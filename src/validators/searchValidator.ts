import { z } from 'zod';

export const searchSchema = z.object({
  q: z
    .string()
    .transform((val) => val.trim().replace(/\s+/g, ' ')) // Trim and ignore multiple spaces
    .refine((val) => val.length >= 2, {
      message: 'Search query must contain at least 2 characters after trimming.',
    })
    .refine((val) => val.length <= 100, {
      message: 'Search query cannot exceed 100 characters.',
    }),
  limit: z
    .preprocess((val) => (val ? parseInt(val as string, 10) : undefined), z.number().int().min(1).max(50))
    .optional()
    .default(20),
});

export type SearchInput = z.infer<typeof searchSchema>;

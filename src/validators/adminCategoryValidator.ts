import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Category name must be at least 2 characters.' })
    .max(50, { message: 'Category name cannot exceed 50 characters.' }),
  slug: z
    .string()
    .min(2, { message: 'Slug must be at least 2 characters.' })
    .max(50, { message: 'Slug cannot exceed 50 characters.' })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: 'Slug must be in kebab-case (lowercase letters, numbers, and dashes).',
    })
    .optional()
    .or(z.literal('')),
  description: z
    .string()
    .max(300, { message: 'Description cannot exceed 300 characters.' })
    .nullable()
    .optional()
    .or(z.literal('')),
  displayOrder: z
    .number()
    .int({ message: 'Display order must be an integer.' })
    .min(0, { message: 'Display order must be a non-negative integer.' })
    .optional(),
  isActive: z.boolean().optional(),
  image: z
    .string()
    .refine((val) => {
      if (!val) return true;
      return val.startsWith('/uploads/') || /^(https?:\/\/)/.test(val);
    }, {
      message: 'Image must be a valid URL starting with http://, https:// or /uploads/'
    })
    .optional()
    .or(z.literal('')),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

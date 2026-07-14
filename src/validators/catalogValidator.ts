import { z } from 'zod';
import { Unit } from '@prisma/client';

export const categorySchema = z.object({
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
    }),
  description: z.string().max(300).nullable().optional(),
  image: z.string().url({ message: 'Category image must be a valid URL.' }),
});

export const productSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: 'Product name must be at least 2 characters.' })
      .max(100, { message: 'Product name cannot exceed 100 characters.' }),
    sku: z
      .string()
      .min(3, { message: 'SKU must be at least 3 characters.' })
      .max(30, { message: 'SKU cannot exceed 30 characters.' }),
    description: z
      .string()
      .min(5, { message: 'Description must be at least 5 characters.' }),
    image: z.string().url({ message: 'Product image must be a valid URL.' }),
    images: z.array(z.string().url()).optional(),
    price: z.number().positive({ message: 'Price must be a positive number.' }),
    discountPrice: z
      .number()
      .positive({ message: 'Discount price must be a positive number.' })
      .nullable()
      .optional(),
    weight: z.number().positive({ message: 'Weight must be a positive number.' }),
    unit: z.nativeEnum(Unit, { message: 'Invalid unit value.' }),
    stock: z.number().int().nonnegative({ message: 'Stock must be a non-negative integer.' }),
    isOrganic: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    categoryId: z.string().min(1, { message: 'Category ID is required.' }),
  })
  .refine(
    (data) => {
      if (data.discountPrice !== undefined && data.discountPrice !== null) {
        return data.discountPrice < data.price;
      }
      return true;
    },
    {
      message: 'Discount price must be less than the regular price.',
      path: ['discountPrice'],
    }
  );

export type CategoryInput = z.infer<typeof categorySchema>;
export type ProductInput = z.infer<typeof productSchema>;

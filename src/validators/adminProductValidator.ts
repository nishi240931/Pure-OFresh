import { z } from 'zod';
import { Unit } from '@prisma/client';

export const adminProductSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: 'Product name must be at least 2 characters.' })
      .max(100, { message: 'Product name cannot exceed 100 characters.' }),
    description: z
      .string()
      .min(5, { message: 'Description must be at least 5 characters.' }),
    price: z.number().positive({ message: 'Price must be a positive number.' }),
    discountPrice: z
      .number()
      .positive({ message: 'Discount price must be a positive number.' })
      .nullable()
      .optional(),
    weight: z.number().positive({ message: 'Weight must be a positive number.' }),
    unit: z.nativeEnum(Unit, { message: 'Invalid unit value.' }),
    stock: z.number().int().nonnegative({ message: 'Stock must be a non-negative integer.' }),
    isOrganic: z.boolean().default(false),
    isFeatured: z.boolean().default(false),
    image: z.string().url({ message: 'Product image must be a valid URL.' }),
    images: z.array(z.string().url()).optional(),
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
      message: 'Discount price must be less than regular price.',
      path: ['discountPrice'],
    }
  );

export const adminStockUpdateSchema = z.object({
  stock: z.number().int().nonnegative({ message: 'Stock must be a non-negative integer.' }),
});

export const adminBooleanToggleSchema = z.object({
  value: z.boolean(),
});

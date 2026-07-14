import { z } from 'zod';

const cleanValue = (val: any) => {
  if (val === undefined || val === null || val === '') return undefined;
  if (typeof val === 'string') {
    const s = val.trim();
    if (s === '' || s === 'null' || s === 'undefined') return undefined;
    return s;
  }
  return val;
};

export const filterSchema = z
  .object({
    category: z
      .preprocess((val) => cleanValue(val), z.string().optional())
      .optional(),
    minPrice: z
      .preprocess((val) => {
        const cleaned = cleanValue(val);
        return cleaned !== undefined ? parseFloat(cleaned as string) : undefined;
      }, z.number().nonnegative().optional())
      .optional(),
    maxPrice: z
      .preprocess((val) => {
        const cleaned = cleanValue(val);
        return cleaned !== undefined ? parseFloat(cleaned as string) : undefined;
      }, z.number().nonnegative().optional())
      .optional(),
    organic: z
      .preprocess((val) => {
        const cleaned = cleanValue(val);
        if (cleaned === 'true' || cleaned === true) return true;
        if (cleaned === 'false' || cleaned === false) return false;
        return undefined;
      }, z.boolean().optional())
      .optional(),
    featured: z
      .preprocess((val) => {
        const cleaned = cleanValue(val);
        if (cleaned === 'true' || cleaned === true) return true;
        if (cleaned === 'false' || cleaned === false) return false;
        return undefined;
      }, z.boolean().optional())
      .optional(),
    inStock: z
      .preprocess((val) => {
        const cleaned = cleanValue(val);
        if (cleaned === 'true' || cleaned === true) return true;
        if (cleaned === 'false' || cleaned === false) return false;
        return undefined;
      }, z.boolean().optional())
      .optional(),
    sort: z
      .preprocess((val) => cleanValue(val), z.enum(['price_asc', 'price_desc', 'rating_desc', 'discount_desc', 'newest', 'featured']).optional())
      .optional(),
    page: z
      .preprocess((val) => {
        const cleaned = cleanValue(val);
        return cleaned !== undefined ? parseInt(cleaned as string, 10) : undefined;
      }, z.number().int().min(1).optional())
      .optional()
      .default(1),
    limit: z
      .preprocess((val) => {
        const cleaned = cleanValue(val);
        return cleaned !== undefined ? parseInt(cleaned as string, 10) : undefined;
      }, z.number().int().min(1).max(50).optional())
      .optional()
      .default(20),
  })
  .refine(
    (data) => {
      if (data.minPrice !== undefined && data.maxPrice !== undefined) {
        return data.maxPrice >= data.minPrice;
      }
      return true;
    },
    {
      message: 'Maximum price must be greater than or equal to minimum price.',
      path: ['maxPrice'],
    }
  );

export type FilterInput = z.infer<typeof filterSchema>;

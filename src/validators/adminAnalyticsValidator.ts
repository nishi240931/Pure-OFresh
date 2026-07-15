import { z } from 'zod';

export const adminAnalyticsQuerySchema = z.object({
  interval: z.enum(['today', 'week', 'month', 'this_month', 'this_year', 'custom']).default('month'),
  customStart: z.string().optional(),
  customEnd: z.string().optional(),
});

export const adminAnalyticsChartsQuerySchema = z.object({
  period: z.enum(['today', 'week', 'month', 'this_month', 'this_year', 'custom']).default('month'),
  customStart: z.string().optional(),
  customEnd: z.string().optional(),
});

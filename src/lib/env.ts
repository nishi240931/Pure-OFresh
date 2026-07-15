import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid connection string.'),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1, 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required.'),
  CLERK_SECRET_KEY: z.string().min(1, 'CLERK_SECRET_KEY is required.'),
  NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string().min(1, 'NEXT_PUBLIC_RAZORPAY_KEY_ID is required.'),
  RAZORPAY_KEY_SECRET: z.string().min(1, 'RAZORPAY_KEY_SECRET is required.'),
});

export const validateEnv = () => {
  if (typeof window === 'undefined') {
    const parsed = envSchema.safeParse(process.env);
    if (!parsed.success) {
      console.error('❌ Environment validation failed:', parsed.error.flatten().fieldErrors);
      throw new Error(
        `Critical: Missing or invalid environment configurations: ${JSON.stringify(
          parsed.error.flatten().fieldErrors
        )}`
      );
    }
  }
};

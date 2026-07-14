import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { userRepository } from '@/repositories/userRepository';
import { paymentService } from '@/services/paymentService';
import { createPaymentOrderSchema } from '@/validators/paymentValidator';

export async function POST(req: Request) {
  try {
    let clerkId: string | null = null;
    try {
      const authResult = await auth();
      clerkId = authResult.userId;
    } catch (e) {}

    if (!clerkId && process.env.NODE_ENV === 'development') {
      clerkId = req.headers.get('x-test-clerk-id');
    }

    if (!clerkId) {
      return NextResponse.json(
        { success: false, error: 'UNAUTHORIZED', message: 'You must be signed in.' },
        { status: 401 }
      );
    }

    const user = await userRepository.findByClerkId(clerkId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'USER_NOT_FOUND', message: 'User profile not found.' },
        { status: 404 }
      );
    }

    const body = await req.json();
    const validation = createPaymentOrderSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'INVALID_REQUEST',
          message: validation.error.issues.map((i) => i.message).join(', '),
        },
        { status: 400 }
      );
    }

    const response = await paymentService.createRazorpayOrder(user.id, validation.data.orderId);
    return NextResponse.json(response);
  } catch (err: any) {
    console.error('Failed to create Razorpay Order:', err);
    return NextResponse.json(
      {
        success: false,
        message: err.message || 'Payment order creation failed.',
        error: 'ORDER_CREATION_FAILED',
      },
      { status: 400 }
    );
  }
}

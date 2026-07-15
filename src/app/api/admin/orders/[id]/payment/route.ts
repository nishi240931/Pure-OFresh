import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { userRepository } from '@/repositories/userRepository';
import { adminOrderService } from '@/services/adminOrderService';
import { updatePaymentStatusSchema } from '@/validators/adminOrderValidator';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'FORBIDDEN', message: 'Access denied.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = updatePaymentStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Invalid payment status value.',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const updatedOrder = await adminOrderService.updatePaymentStatus(id, parsed.data.paymentStatus);
    return NextResponse.json({
      success: true,
      message: 'Payment status updated successfully.',
      data: updatedOrder,
    });
  } catch (err: any) {
    console.error('Failed to update order payment status:', err);
    if (err.message.includes('Cannot refund')) {
      return NextResponse.json(
        { success: false, error: 'INVALID_TRANSITION', message: err.message },
        { status: 400 }
      );
    }
    if (err.message.includes('not found')) {
      return NextResponse.json(
        { success: false, message: 'Order not found.' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to update payment status.' },
      { status: 500 }
    );
  }
}

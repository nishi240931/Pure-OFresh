import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { userRepository } from '@/repositories/userRepository';
import { orderService } from '@/services/orderService';
import { orderIdSchema } from '@/validators/orderValidator';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED', message: 'You must be signed in.' }, { status: 401 });
    }

    const user = await userRepository.findByClerkId(clerkId);
    if (!user) {
      return NextResponse.json({ success: false, error: 'USER_NOT_FOUND', message: 'User profile not found.' }, { status: 404 });
    }

    const result = orderIdSchema.safeParse({ id });
    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid order ID format.',
        details: result.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const cancelledOrder = await orderService.cancelOrder(user.id, id);
    return NextResponse.json({ success: true, message: 'Order cancelled successfully.', data: cancelledOrder });
  } catch (err: any) {
    console.error('Error cancelling order:', err);
    if (err.message.includes('not allowed')) {
      return NextResponse.json({ success: false, error: 'CANCELLATION_FAILED', message: err.message }, { status: 400 });
    }
    if (err.message.includes('not found') || err.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, error: 'NOT_FOUND', message: err.message }, { status: 404 });
    }
    return NextResponse.json({ success: false, error: 'SERVER_ERROR', message: err.message }, { status: 500 });
  }
}

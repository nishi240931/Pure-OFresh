import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { userRepository } from '@/repositories/userRepository';
import { orderService } from '@/services/orderService';
import { orderIdSchema, updateStatusSchema } from '@/validators/orderValidator';

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

    if (user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'FORBIDDEN', message: 'Admin privileges required.' }, { status: 403 });
    }

    const idResult = orderIdSchema.safeParse({ id });
    if (!idResult.success) {
      return NextResponse.json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid order ID format.',
        details: idResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const body = await req.json();
    const statusResult = updateStatusSchema.safeParse(body);
    if (!statusResult.success) {
      return NextResponse.json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid target order status value.',
        details: statusResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const updatedOrder = await orderService.updateOrderStatusByAdmin(id, statusResult.data.status);
    return NextResponse.json({ success: true, message: 'Order status updated successfully.', data: updatedOrder });
  } catch (err: any) {
    console.error('Error updating order status by admin:', err);
    if (err.message.includes('Invalid status transition')) {
      return NextResponse.json({ success: false, error: 'INVALID_TRANSITION', message: err.message }, { status: 400 });
    }
    if (err.message.includes('not found')) {
      return NextResponse.json({ success: false, error: 'NOT_FOUND', message: err.message }, { status: 404 });
    }
    return NextResponse.json({ success: false, error: 'SERVER_ERROR', message: err.message }, { status: 500 });
  }
}

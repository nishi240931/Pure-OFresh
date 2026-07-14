import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { userRepository } from '@/repositories/userRepository';
import { orderRepository } from '@/repositories/orderRepository';
import { orderService } from '@/services/orderService';
import { createOrderSchema } from '@/validators/orderValidator';

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED', message: 'You must be signed in.' }, { status: 401 });
    }

    const user = await userRepository.findByClerkId(clerkId);
    if (!user) {
      return NextResponse.json({ success: false, error: 'USER_NOT_FOUND', message: 'User profile not found.' }, { status: 404 });
    }

    const body = await req.json();
    const result = createOrderSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid order request inputs.',
        details: result.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const orderResult = await orderService.createOrderFromCheckout(user.id, result.data);
    if (!orderResult.success) {
      return NextResponse.json(orderResult, { status: 400 });
    }

    return NextResponse.json(orderResult, { status: 201 });
  } catch (err: any) {
    console.error('Error creating order:', err);
    return NextResponse.json({ success: false, error: 'SERVER_ERROR', message: err.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED', message: 'You must be signed in.' }, { status: 401 });
    }

    const user = await userRepository.findByClerkId(clerkId);
    if (!user) {
      return NextResponse.json({ success: false, error: 'USER_NOT_FOUND', message: 'User profile not found.' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const sortParam = searchParams.get('sort') === 'oldest' ? 'oldest' : 'newest';

    const orders = await orderRepository.getOrdersByUser(user.id, sortParam);
    return NextResponse.json({ success: true, data: orders });
  } catch (err: any) {
    console.error('Error fetching orders:', err);
    return NextResponse.json({ success: false, error: 'SERVER_ERROR', message: err.message }, { status: 500 });
  }
}

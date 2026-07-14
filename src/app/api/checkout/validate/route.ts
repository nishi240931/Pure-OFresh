import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { userRepository } from '@/repositories/userRepository';
import { checkoutService } from '@/services/checkoutService';
import { checkoutSchema } from '@/validators/checkoutValidator';

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
    const result = checkoutSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid address ID format.',
        details: result.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const checkoutResult = await checkoutService.validateCheckout(user.id, result.data.addressId);
    if (!checkoutResult.success) {
      return NextResponse.json(checkoutResult, { status: 400 });
    }

    return NextResponse.json(checkoutResult);
  } catch (err: any) {
    console.error('Error validating checkout:', err);
    return NextResponse.json({ success: false, error: 'SERVER_ERROR', message: err.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { userRepository } from '@/repositories/userRepository';
import { addressRepository } from '@/repositories/addressRepository';
import { addressSchema } from '@/validators/addressValidator';

export async function PUT(
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

    const body = await req.json();
    const result = addressSchema.partial().safeParse(body);
    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid address inputs.',
        details: result.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const updatedAddress = await addressRepository.updateAddress(id, user.id, result.data);
    return NextResponse.json({ success: true, data: updatedAddress });
  } catch (err: any) {
    console.error('Error updating address:', err);
    if (err.message.includes('not found') || err.message.includes('unauthorized')) {
      return NextResponse.json({ success: false, error: 'NOT_FOUND', message: err.message }, { status: 404 });
    }
    return NextResponse.json({ success: false, error: 'SERVER_ERROR', message: err.message }, { status: 500 });
  }
}

export async function DELETE(
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

    await addressRepository.deleteAddress(id, user.id);
    return NextResponse.json({ success: true, message: 'Address deleted successfully.' });
  } catch (err: any) {
    console.error('Error deleting address:', err);
    if (err.message.includes('not found') || err.message.includes('unauthorized')) {
      return NextResponse.json({ success: false, error: 'NOT_FOUND', message: err.message }, { status: 404 });
    }
    return NextResponse.json({ success: false, error: 'SERVER_ERROR', message: err.message }, { status: 500 });
  }
}

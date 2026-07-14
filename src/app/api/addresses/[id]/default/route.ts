import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { userRepository } from '@/repositories/userRepository';
import { addressRepository } from '@/repositories/addressRepository';

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

    await addressRepository.setDefaultAddress(id, user.id);
    return NextResponse.json({ success: true, message: 'Default address set successfully.' });
  } catch (err: any) {
    console.error('Error setting default address:', err);
    if (err.message.includes('not found') || err.message.includes('unauthorized')) {
      return NextResponse.json({ success: false, error: 'NOT_FOUND', message: err.message }, { status: 404 });
    }
    return NextResponse.json({ success: false, error: 'SERVER_ERROR', message: err.message }, { status: 500 });
  }
}

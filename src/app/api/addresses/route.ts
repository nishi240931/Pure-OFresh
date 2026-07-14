import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { userRepository } from '@/repositories/userRepository';
import { addressRepository } from '@/repositories/addressRepository';
import { addressSchema } from '@/validators/addressValidator';

export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED', message: 'You must be signed in.' }, { status: 401 });
    }

    const user = await userRepository.findByClerkId(clerkId);
    if (!user) {
      return NextResponse.json({ success: false, error: 'USER_NOT_FOUND', message: 'User profile not found.' }, { status: 404 });
    }

    const addresses = await addressRepository.getUserAddresses(user.id);
    return NextResponse.json({ success: true, data: addresses });
  } catch (err: any) {
    console.error('Error fetching addresses:', err);
    return NextResponse.json({ success: false, error: 'SERVER_ERROR', message: err.message }, { status: 500 });
  }
}

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
    const result = addressSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid address inputs.',
        details: result.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const newAddress = await addressRepository.createAddress(user.id, result.data);
    return NextResponse.json({ success: true, data: newAddress }, { status: 201 });
  } catch (err: any) {
    console.error('Error creating address:', err);
    return NextResponse.json({ success: false, error: 'SERVER_ERROR', message: err.message }, { status: 500 });
  }
}

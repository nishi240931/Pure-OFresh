import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { userRepository } from '@/repositories/userRepository';
import { adminCustomerService } from '@/services/adminCustomerService';

export async function GET(
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

    if (!id || id.length < 5) {
      return NextResponse.json(
        { success: false, message: 'Invalid customer ID.' },
        { status: 400 }
      );
    }

    const customerDetails = await adminCustomerService.getCustomerDetails(id);
    return NextResponse.json({
      success: true,
      message: 'Customer details loaded successfully.',
      data: customerDetails,
    });
  } catch (err: any) {
    console.error('Failed to get customer details:', err);
    if (err.message.includes('not found')) {
      return NextResponse.json(
        { success: false, message: 'Customer not found.' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to get customer details.' },
      { status: 500 }
    );
  }
}

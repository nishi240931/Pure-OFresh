import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { userRepository } from '@/repositories/userRepository';
import { adminCustomerService } from '@/services/adminCustomerService';
import { adminCustomerQuerySchema } from '@/validators/adminCustomerValidator';

export async function GET(req: Request) {
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
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'FORBIDDEN', message: 'Access denied.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const queryParams = {
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') || undefined,
      limit: searchParams.get('limit') || undefined,
      sort: searchParams.get('sort') || undefined,
    };

    const parsedQuery = adminCustomerQuerySchema.safeParse(queryParams);
    if (!parsedQuery.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Invalid query parameters.',
          details: parsedQuery.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const result = await adminCustomerService.getCustomerList(parsedQuery.data);
    return NextResponse.json({
      success: true,
      message: 'Customers loaded successfully.',
      data: result,
    });
  } catch (err: any) {
    console.error('Failed to list administrative customers:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to list customers.' },
      { status: 500 }
    );
  }
}

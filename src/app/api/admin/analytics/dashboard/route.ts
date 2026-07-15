import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { userRepository } from '@/repositories/userRepository';
import { adminAnalyticsService } from '@/services/adminAnalyticsService';
import { adminAnalyticsQuerySchema } from '@/validators/adminAnalyticsValidator';

export async function GET(req: Request) {
  try {
    let clerkId: string | null = null;
    try {
      const authResult = await auth();
      clerkId = authResult.userId;
    } catch (e) {}

    // Allow testing bypass in development if header is present
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
      interval: searchParams.get('interval') || undefined,
      customStart: searchParams.get('customStart') || undefined,
      customEnd: searchParams.get('customEnd') || undefined,
    };

    const parsedQuery = adminAnalyticsQuerySchema.safeParse(queryParams);
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

    const result = await adminAnalyticsService.getDashboardSummary(parsedQuery.data);
    return NextResponse.json({
      success: true,
      message: 'Dashboard analytics loaded successfully.',
      data: result,
    });
  } catch (err: any) {
    console.error('Failed to load dashboard summary analytics:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to fetch analytics.' },
      { status: 500 }
    );
  }
}

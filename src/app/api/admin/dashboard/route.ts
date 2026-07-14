import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { userRepository } from '@/repositories/userRepository';
import { adminService } from '@/services/adminService';

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
      console.warn('Unauthorized access attempt: No valid Clerk session found.');
      return NextResponse.json(
        { success: false, error: 'UNAUTHORIZED', message: 'You must be signed in.' },
        { status: 401 }
      );
    }

    const user = await userRepository.findByClerkId(clerkId);
    if (!user || user.role !== 'ADMIN') {
      console.warn(`Forbidden access attempt: Clerk User ${clerkId} lacks ADMIN role. DB role: ${user?.role || 'none'}`);
      return NextResponse.json(
        { success: false, error: 'FORBIDDEN', message: 'Access denied.' },
        { status: 403 }
      );
    }

    const stats = await adminService.getDashboardStats();
    return NextResponse.json({
      success: true,
      message: 'Dashboard metrics loaded successfully',
      data: stats,
    });
  } catch (err: any) {
    console.error('Failed to load dashboard metrics route:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to fetch dashboard metrics.' },
      { status: 500 }
    );
  }
}

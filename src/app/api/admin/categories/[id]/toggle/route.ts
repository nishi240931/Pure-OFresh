import { NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/authHelper';
import { userService } from '@/services/userService';
import { adminCategoryService } from '@/services/adminCategoryService';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    let authCheck = await checkAdmin();
    if (!authCheck.authorized && process.env.NODE_ENV === 'development') {
      const testClerkId = req.headers.get('x-test-clerk-id');
      if (testClerkId) {
        const testUser = await userService.getUserProfile(testClerkId);
        if (testUser && testUser.role === 'ADMIN') {
          authCheck = { authorized: true, user: testUser };
        }
      }
    }

    if (!authCheck.authorized) {
      return NextResponse.json(
        { success: false, error: authCheck.error || 'UNAUTHORIZED', message: 'Unauthorized access.' },
        { status: authCheck.status || 401 }
      );
    }

    const { id } = await params;
    const updated = await adminCategoryService.toggleCategoryStatus(id);

    return NextResponse.json({
      success: true,
      message: 'Category status toggled successfully',
      data: updated,
    });
  } catch (err: any) {
    console.error('PATCH /api/admin/categories/[id]/toggle error:', err);
    return NextResponse.json(
      { success: false, error: 'TOGGLE_FAILED', message: err.message || 'Failed to toggle category status.' },
      { status: err.message?.includes('not found') ? 404 : 500 }
    );
  }
}

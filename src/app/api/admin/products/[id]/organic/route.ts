import { NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/authHelper';
import { userService } from '@/services/userService';
import { adminProductService } from '@/services/adminProductService';
import { adminBooleanToggleSchema } from '@/validators/adminProductValidator';

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
    const body = await req.json();
    const validated = adminBooleanToggleSchema.parse(body);

    const product = await adminProductService.toggleOrganic(id, validated.value);

    return NextResponse.json({
      success: true,
      message: 'Organic status updated successfully',
      data: product,
    });
  } catch (err: any) {
    console.error('Failed to toggle organic status:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to update organic status.' },
      { status: err.name === 'ZodError' ? 400 : 500 }
    );
  }
}

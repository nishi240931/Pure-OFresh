import { NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/authHelper';
import { userService } from '@/services/userService';
import { adminCategoryService } from '@/services/adminCategoryService';

export async function GET(
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
    const category = await adminCategoryService.getCategoryById(id);

    return NextResponse.json({
      success: true,
      message: 'Category fetched successfully',
      data: category,
    });
  } catch (err: any) {
    console.error('GET /api/admin/categories/[id] error:', err);
    return NextResponse.json(
      { success: false, error: 'FETCH_FAILED', message: err.message || 'Failed to fetch category.' },
      { status: err.message?.includes('not found') ? 404 : 500 }
    );
  }
}

export async function PUT(
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
    const category = await adminCategoryService.updateCategory(id, body);

    return NextResponse.json({
      success: true,
      message: 'Category updated successfully',
      data: category,
    });
  } catch (err: any) {
    console.error('PUT /api/admin/categories/[id] error:', err);
    return NextResponse.json(
      { success: false, error: 'UPDATE_FAILED', message: err.message || 'Failed to update category.' },
      { status: err.message?.includes('Validation') ? 400 : (err.message?.includes('not found') ? 404 : 500) }
    );
  }
}

export async function DELETE(
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
    await adminCategoryService.deleteCategory(id);

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (err: any) {
    console.error('DELETE /api/admin/categories/[id] error:', err);
    return NextResponse.json(
      { success: false, error: 'DELETE_FAILED', message: err.message || 'Failed to delete category.' },
      { status: err.message?.includes('contains products') ? 400 : (err.message?.includes('not found') ? 404 : 500) }
    );
  }
}

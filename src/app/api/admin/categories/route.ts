import { NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/authHelper';
import { userService } from '@/services/userService';
import { adminCategoryService } from '@/services/adminCategoryService';

export async function GET(req: Request) {
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

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;
    const isActiveStatus = (searchParams.get('isActiveStatus') as any) || undefined;
    const sortBy = searchParams.get('sortBy') || undefined;
    const sortOrder = (searchParams.get('sortOrder') as any) || 'asc';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const result = await adminCategoryService.getCategories({
      search,
      isActiveStatus,
      sortBy,
      sortOrder,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      message: 'Categories fetched successfully',
      data: result,
    });
  } catch (err: any) {
    console.error('GET /api/admin/categories error:', err);
    return NextResponse.json(
      { success: false, error: 'FETCH_FAILED', message: err.message || 'Failed to fetch categories.' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
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

    const body = await req.json();
    const category = await adminCategoryService.createCategory(body);

    return NextResponse.json({
      success: true,
      message: 'Category created successfully',
      data: category,
    }, { status: 201 });
  } catch (err: any) {
    console.error('POST /api/admin/categories error:', err);
    return NextResponse.json(
      { success: false, error: 'CREATE_FAILED', message: err.message || 'Failed to create category.' },
      { status: err.message?.includes('Validation') ? 400 : 500 }
    );
  }
}

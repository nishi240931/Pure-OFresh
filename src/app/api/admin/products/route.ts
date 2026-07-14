import { NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/authHelper';
import { userService } from '@/services/userService';
import { adminProductService } from '@/services/adminProductService';

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
    const categoryId = searchParams.get('categoryId') || undefined;
    const stockStatus = (searchParams.get('stockStatus') as any) || undefined;
    const sortBy = searchParams.get('sortBy') || undefined;
    const sortOrder = (searchParams.get('sortOrder') as any) || 'desc';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const result = await adminProductService.getProducts({
      search,
      categoryId,
      stockStatus,
      sortBy,
      sortOrder,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      message: 'Products loaded successfully',
      data: {
        products: result.products,
        total: result.total,
        page,
        limit,
      },
    });
  } catch (err: any) {
    console.error('Failed to load admin products:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to fetch catalog.' },
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
    const product = await adminProductService.createProduct(body);

    return NextResponse.json(
      {
        success: true,
        message: 'Product created successfully',
        data: product,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('Failed to create product:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to create product.' },
      { status: err.name === 'ZodError' ? 400 : 500 }
    );
  }
}

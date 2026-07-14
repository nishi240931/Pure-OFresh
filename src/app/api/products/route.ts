import { NextResponse } from 'next/server';
import { productService } from '@/services/productService';
import { checkAdmin } from '@/lib/authHelper';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;
    const minPrice = searchParams.get('minPrice') || undefined;
    const maxPrice = searchParams.get('maxPrice') || undefined;
    const organic = searchParams.get('organic') || undefined;
    const featured = searchParams.get('featured') || undefined;
    const inStock = searchParams.get('inStock') || undefined;
    const sort = searchParams.get('sort') || undefined;
    const page = searchParams.get('page') || undefined;
    const limit = searchParams.get('limit') || undefined;

    const result = await productService.getAllProducts({
      category,
      minPrice,
      maxPrice,
      organic,
      featured,
      inStock,
      sort,
      page,
      limit,
    });

    if (result.products.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No matching products found',
        data: [],
        pagination: result.pagination,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Products fetched successfully',
      data: result.products,
      pagination: result.pagination,
    });
  } catch (error: any) {
    console.error('Products API query failure:', error);

    const isValidationError = error.message?.includes('Validation failed');
    if (isValidationError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid filter parameters',
          error: 'INVALID_FILTER',
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to fetch products.',
        error: 'SERVER_ERROR',
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    // 1. Authorization check
    const authStatus = await checkAdmin();
    if (!authStatus.authorized) {
      return NextResponse.json({ success: false, error: authStatus.error }, { status: authStatus.status });
    }

    // 2. Parse body
    const body = await req.json();

    // 3. Process creation
    const product = await productService.createProduct(body);
    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create product.' },
      { status: error.message?.includes('Validation') ? 400 : 500 }
    );
  }
}

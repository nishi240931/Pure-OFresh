import { NextResponse } from 'next/server';
import { productSearchService } from '@/services/productSearchService';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');
    const limit = searchParams.get('limit');

    const result = await productSearchService.searchProducts(q, limit);

    if (result.totalResults === 0) {
      return NextResponse.json({
        success: true,
        message: 'No matching products found',
        data: [],
        totalResults: 0,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Search completed successfully',
      data: result.results,
      totalResults: result.totalResults,
    });
  } catch (error: any) {
    console.error('Search API failure:', error);
    
    const isValidationError = error.message?.includes('Validation failed');
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'An unexpected search error occurred.',
        data: [],
        totalResults: 0,
      },
      { status: isValidationError ? 400 : 500 }
    );
  }
}

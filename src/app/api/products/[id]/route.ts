import { NextResponse } from 'next/server';
import { productService } from '@/services/productService';
import { checkAdmin } from '@/lib/authHelper';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await productService.getProductById(id);
    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Product not found.' },
      { status: error.message?.includes('not found') ? 404 : 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Authorization check
    const authStatus = await checkAdmin();
    if (!authStatus.authorized) {
      return NextResponse.json({ success: false, error: authStatus.error }, { status: authStatus.status });
    }

    // 2. Parse body
    const body = await req.json();

    // 3. Process update
    const product = await productService.updateProduct(id, body);
    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update product.' },
      { status: error.message?.includes('not found') ? 404 : 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Authorization check
    const authStatus = await checkAdmin();
    if (!authStatus.authorized) {
      return NextResponse.json({ success: false, error: authStatus.error }, { status: authStatus.status });
    }

    // 2. Process deletion
    await productService.deleteProduct(id);
    return NextResponse.json({ success: true, message: 'Product deleted successfully.' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete product.' },
      { status: error.message?.includes('not found') ? 404 : 400 }
    );
  }
}

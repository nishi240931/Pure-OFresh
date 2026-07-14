import { NextResponse } from 'next/server';
import { categoryService } from '@/services/categoryService';
import { checkAdmin } from '@/lib/authHelper';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const category = await categoryService.getCategoryById(id);
    return NextResponse.json({ success: true, category });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Category not found.' },
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

    // 2. Parse and validate body
    const body = await req.json();

    // 3. Process update
    const category = await categoryService.updateCategory(id, body);
    return NextResponse.json({ success: true, category });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update category.' },
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
    await categoryService.deleteCategory(id);
    return NextResponse.json({ success: true, message: 'Category deleted successfully.' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete category.' },
      { status: error.message?.includes('not found') ? 404 : 400 }
    );
  }
}

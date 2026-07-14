import { NextResponse } from 'next/server';
import { categoryService } from '@/services/categoryService';
import { checkAdmin } from '@/lib/authHelper';

export async function GET() {
  try {
    const list = await categoryService.getAllCategories();
    return NextResponse.json({ success: true, categories: list });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch categories.' },
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
    const category = await categoryService.createCategory(body);
    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create category.' },
      { status: error.message?.includes('Validation') ? 400 : 500 }
    );
  }
}

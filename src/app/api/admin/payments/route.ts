import { NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/authHelper';
import { paymentRepository } from '@/repositories/paymentRepository';

export async function GET() {
  try {
    const authStatus = await checkAdmin();
    if (!authStatus.authorized) {
      return NextResponse.json(
        { success: false, error: authStatus.error, message: 'Unauthorized access.' },
        { status: authStatus.status }
      );
    }

    const history = await paymentRepository.getPaymentHistory();
    return NextResponse.json({
      success: true,
      message: 'Payment history fetched successfully',
      data: history,
    });
  } catch (err: any) {
    console.error('Failed to load admin payment history:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to fetch payment history.' },
      { status: 500 }
    );
  }
}

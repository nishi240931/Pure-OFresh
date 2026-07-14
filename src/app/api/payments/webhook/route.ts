import { NextResponse } from 'next/server';
import { paymentService } from '@/services/paymentService';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature') || '';

    const result = await paymentService.processWebhook(rawBody, signature);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Webhook processing failure:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Webhook failed.' },
      { status: 400 }
    );
  }
}

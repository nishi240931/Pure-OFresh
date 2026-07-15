import { NextResponse } from 'next/server';

export interface ApiResponseEnvelope<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  details?: any;
}

export function apiSuccess<T>(data: T, message = 'Operation successful', status = 200) {
  const envelope: ApiResponseEnvelope<T> = {
    success: true,
    message,
    data,
  };
  return NextResponse.json(envelope, { status });
}

export function apiError(
  message: string,
  errorCode = 'INTERNAL_ERROR',
  status = 500,
  details?: any
) {
  // Hide detailed system properties or stack traces in production environment
  const safeDetails =
    process.env.NODE_ENV === 'production' && details instanceof Error
      ? undefined
      : details;

  const envelope: ApiResponseEnvelope<never> = {
    success: false,
    message,
    error: errorCode,
    ...(safeDetails !== undefined && { details: safeDetails }),
  };

  return NextResponse.json(envelope, { status });
}

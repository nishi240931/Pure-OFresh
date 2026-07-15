import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { userRepository } from '@/repositories/userRepository';

export async function POST(req: Request) {
  try {
    let clerkId: string | null = null;
    try {
      const authResult = await auth();
      clerkId = authResult.userId;
    } catch (e) {}

    // Support dev testing fallback
    if (!clerkId && process.env.NODE_ENV === 'development') {
      clerkId = req.headers.get('x-test-clerk-id');
    }

    if (!clerkId) {
      return NextResponse.json(
        { success: false, error: 'UNAUTHORIZED', message: 'You must be signed in.' },
        { status: 401 }
      );
    }

    const user = await userRepository.findByClerkId(clerkId);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'FORBIDDEN', message: 'Admin access required.' },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file uploaded.' },
        { status: 400 }
      );
    }

    // Read Cloudinary configs
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
    const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '';
    const apiKey = process.env.CLOUDINARY_API_KEY || '';
    const apiSecret = process.env.CLOUDINARY_API_SECRET || '';

    // Log the configuration presence (true/false only) for diagnostics
    console.log('[Cloudinary Config Diagnostics]:', {
      CLOUDINARY_CLOUD_NAME: !!process.env.CLOUDINARY_CLOUD_NAME,
      CLOUDINARY_API_KEY: !!process.env.CLOUDINARY_API_KEY,
      CLOUDINARY_API_SECRET: !!process.env.CLOUDINARY_API_SECRET,
      NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: !!process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
    });

    // Determine missing environment variables
    const missingVars: string[] = [];
    if (!cloudName) missingVars.push('CLOUDINARY_CLOUD_NAME');
    if (!preset) missingVars.push('NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET');
    if (!apiKey) missingVars.push('CLOUDINARY_API_KEY');
    if (!apiSecret) missingVars.push('CLOUDINARY_API_SECRET');

    if (missingVars.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Cloudinary is not configured correctly. Missing environment variables: ${missingVars.join(', ')}` 
        },
        { status: 500 }
      );
    }

    // Convert file to buffer and then upload to Cloudinary
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append('upload_preset', preset);
    cloudinaryFormData.append('file', file);

    const cloudinaryRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: cloudinaryFormData,
      }
    );

    if (!cloudinaryRes.ok) {
      const errData = await cloudinaryRes.json().catch(() => ({}));
      return NextResponse.json(
        { 
          success: false, 
          message: errData.error?.message || 'Cloudinary upload rejected.', 
          details: errData 
        },
        { status: 500 }
      );
    }

    const data = await cloudinaryRes.json();

    return NextResponse.json({
      success: true,
      secure_url: data.secure_url,
    });
  } catch (err: any) {
    console.error('Failed to upload file to Cloudinary:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'File upload failed.' },
      { status: 500 }
    );
  }
}

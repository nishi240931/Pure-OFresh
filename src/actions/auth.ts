'use server';

import { currentUser } from '@clerk/nextjs/server';
import { userService } from '@/services/userService';

export interface DatabaseUserResponse {
  success: boolean;
  user: {
    id: string;
    clerkId: string;
    fullName: string;
    email: string;
    phone: string | null;
    profileImage: string | null;
    role: 'CUSTOMER' | 'ADMIN';
  } | null;
  error?: string;
}

export async function syncUserAction(): Promise<DatabaseUserResponse> {
  try {
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return { success: true, user: null };
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress;
    if (!email) {
      return { success: false, user: null, error: 'User email not found in Clerk session.' };
    }

    const fullName = clerkUser.fullName || 
      `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 
      'Pure O Fresh Customer';

    const phone = clerkUser.phoneNumbers[0]?.phoneNumber || null;
    const profileImage = clerkUser.imageUrl || null;

    const dbUser = await userService.syncClerkUser({
      clerkId: clerkUser.id,
      fullName,
      email,
      phone,
      profileImage,
    });

    return {
      success: true,
      user: {
        id: dbUser.id,
        clerkId: dbUser.clerkId,
        fullName: dbUser.fullName,
        email: dbUser.email,
        phone: dbUser.phone,
        profileImage: dbUser.profileImage,
        role: dbUser.role, // CUSTOMER or ADMIN
      },
    };
  } catch (error: any) {
    console.error('Failed to sync user session:', error);
    return {
      success: false,
      user: null,
      error: error.message || 'Database error occurred during session synchronization.',
    };
  }
}

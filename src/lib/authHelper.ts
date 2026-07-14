import { auth } from '@clerk/nextjs/server';
import { userService } from '@/services/userService';

export interface AdminCheckResponse {
  authorized: boolean;
  status?: number;
  error?: string;
  user?: any;
}

export async function checkAdmin(): Promise<AdminCheckResponse> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { authorized: false, status: 401, error: 'Unauthorized: Access requires active login session.' };
    }

    const dbUser = await userService.getUserProfile(userId);
    if (!dbUser) {
      return { authorized: false, status: 401, error: 'Unauthorized: User profile does not exist in store.' };
    }

    if (dbUser.role !== 'ADMIN') {
      return { authorized: false, status: 403, error: 'Forbidden: Action requires Admin role permissions.' };
    }

    return { authorized: true, user: dbUser };
  } catch (error: any) {
    console.error('Admin check failed:', error);
    return { authorized: false, status: 500, error: 'Internal server authorization check failure.' };
  }
}

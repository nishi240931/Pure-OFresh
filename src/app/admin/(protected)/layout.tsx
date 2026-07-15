import { redirect } from 'next/navigation';
import { auth, currentUser } from '@clerk/nextjs/server';
import { userRepository } from '@/repositories/userRepository';
import { userService } from '@/services/userService';
import AdminLayoutWrapper from '@/components/AdminLayoutWrapper';

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId: clerkId } = await auth();
  
  if (!clerkId) {
    redirect('/login');
  }

  let user = await userRepository.findByClerkId(clerkId);
  
  if (!user) {
    // Sync profile to database if not present yet
    const clerkUser = await currentUser();
    if (clerkUser) {
      const email = clerkUser.emailAddresses[0]?.emailAddress || '';
      const fullName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User';
      user = await userService.syncClerkUser({
        clerkId,
        email,
        fullName,
        profileImage: clerkUser.imageUrl,
      });
    }
  }
  
  // Verify ADMIN role
  if (!user || user.role !== 'ADMIN') {
    console.warn(`Unauthorized Admin layout access block for Clerk User: ${clerkId}`);
    redirect('/admin/access-denied');
  }

  // Pass user info to client layout wrapper
  const adminUser = {
    fullName: user.fullName,
    email: user.email,
    profileImage: user.profileImage,
  };

  return (
    <AdminLayoutWrapper user={adminUser}>
      {children}
    </AdminLayoutWrapper>
  );
}

import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { userRepository } from '@/repositories/userRepository';
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

  const user = await userRepository.findByClerkId(clerkId);
  
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

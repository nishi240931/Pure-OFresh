import { userRepository } from '@/repositories/userRepository';
import { User, Role } from '@prisma/client';
import { userProfileSchema } from '@/validators/userValidator';

export class UserService {
  async syncClerkUser(data: {
    clerkId: string;
    fullName: string;
    email: string;
    phone?: string | null;
    profileImage?: string | null;
  }): Promise<User> {
    if (!data.clerkId || !data.email) {
      throw new Error('Clerk ID and email are required to sync user.');
    }

    // 1. Check if user already exists by clerkId
    const existingByClerk = await userRepository.findByClerkId(data.clerkId);
    if (existingByClerk) {
      return existingByClerk;
    }

    // 2. Fallback: Check if user exists by email (e.g. pre-existing email-only record)
    const existingByEmail = await userRepository.findByEmail(data.email);
    if (existingByEmail) {
      // Link the Clerk account to this pre-existing record to prevent duplicates
      return userRepository.update(existingByEmail.id, {
        fullName: data.fullName,
        profileImage: data.profileImage ?? existingByEmail.profileImage,
        phone: data.phone ?? existingByEmail.phone,
      });
    }

    // 3. Perform server-side validation using Zod
    const validatedData = userProfileSchema.safeParse({
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
    });

    if (!validatedData.success) {
      throw new Error(`User validation failed: ${validatedData.error.message}`);
    }

    // 4. Default first user in the database to ADMIN for testing convenience, others CUSTOMER
    // (Or we can check if the email belongs to the admin list)
    let role: Role = Role.CUSTOMER;
    const adminEmails = [
      'nishitha@pureofresh.com',
      'gudurunishithareddy@gmail.com',
      'nishithareddy561@gmail.com',
      'nishithareddyguduru@gmail.com'
    ];
    if (
      data.email.toLowerCase().includes('admin') || 
      adminEmails.includes(data.email.toLowerCase())
    ) {
      role = Role.ADMIN;
    }

    // 5. Create new User
    return userRepository.create({
      clerkId: data.clerkId,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      profileImage: data.profileImage,
      role,
    });
  }

  async getUserProfile(clerkId: string): Promise<User | null> {
    return userRepository.findByClerkId(clerkId);
  }
}

export const userService = new UserService();

import { db } from '@/lib/db';
import { User, Role } from '@prisma/client';

export class UserRepository {
  async findByClerkId(clerkId: string): Promise<User | null> {
    return db.user.findUnique({
      where: { clerkId },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return db.user.findUnique({
      where: { email },
    });
  }

  async create(data: {
    clerkId: string;
    fullName: string;
    email: string;
    phone?: string | null;
    profileImage?: string | null;
    role?: Role;
  }): Promise<User> {
    return db.user.create({
      data: {
        clerkId: data.clerkId,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        profileImage: data.profileImage,
        role: data.role ?? Role.CUSTOMER,
      },
    });
  }

  async update(
    id: string,
    data: Partial<{
      fullName: string;
      phone: string | null;
      profileImage: string | null;
      role: Role;
    }>
  ): Promise<User> {
    return db.user.update({
      where: { id },
      data,
    });
  }
}

export const userRepository = new UserRepository();

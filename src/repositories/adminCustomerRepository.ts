import { db } from '@/lib/db';

export class AdminCustomerRepository {
  async getCustomersWithOrders(params: {
    search?: string;
  }) {
    const { search } = params;
    const where: any = {
      role: 'CUSTOMER',
    };

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    return db.user.findMany({
      where,
      include: {
        orders: {
          select: {
            id: true,
            grandTotal: true,
            paymentStatus: true,
            createdAt: true,
          },
        },
        addresses: true,
      },
    });
  }

  async getCustomerById(id: string) {
    return db.user.findUnique({
      where: { id },
      include: {
        addresses: true,
        orders: {
          orderBy: { createdAt: 'desc' },
          include: {
            items: true,
          },
        },
      },
    });
  }
}

export const adminCustomerRepository = new AdminCustomerRepository();

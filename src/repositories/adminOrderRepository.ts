import { db } from '@/lib/db';
import { OrderStatus, PaymentStatus } from '@prisma/client';

export class AdminOrderRepository {
  async listOrders(params: {
    search?: string;
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    page: number;
    limit: number;
    sort: 'newest' | 'oldest' | 'highest_amount' | 'lowest_amount';
  }) {
    const { search, status, paymentStatus, page, limit, sort } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      const orConditions: any[] = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { user: { fullName: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } }
      ];
      // Safely append id contains check if search could match UUID format
      if (/^[0-9a-fA-F-]+$/.test(search)) {
        orConditions.push({ id: { contains: search, mode: 'insensitive' } });
      }
      where.OR = orConditions;
    }

    if (status) {
      where.orderStatus = status;
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'oldest') {
      orderBy = { createdAt: 'asc' };
    } else if (sort === 'highest_amount') {
      orderBy = { grandTotal: 'desc' };
    } else if (sort === 'lowest_amount') {
      orderBy = { grandTotal: 'asc' };
    }

    const [orders, totalCount] = await Promise.all([
      db.order.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              profileImage: true,
            },
          },
          address: true,
          items: true,
        },
      }),
      db.order.count({ where }),
    ]);

    return {
      orders,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    };
  }

  async getOrderById(id: string) {
    return db.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profileImage: true,
          },
        },
        address: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async updateOrderStatus(id: string, status: OrderStatus, tx?: any) {
    const prisma = tx || db;
    return prisma.order.update({
      where: { id },
      data: { orderStatus: status },
    });
  }

  async updatePaymentStatus(id: string, paymentStatus: PaymentStatus, tx?: any) {
    const prisma = tx || db;
    const updateData: any = { paymentStatus };
    if (paymentStatus === PaymentStatus.PAID) {
      updateData.paymentCompletedAt = new Date();
    }
    return prisma.order.update({
      where: { id },
      data: updateData,
    });
  }
}

export const adminOrderRepository = new AdminOrderRepository();

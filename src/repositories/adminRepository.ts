import { db } from '@/lib/db';

export class AdminRepository {
  async getTotalRevenue(): Promise<number> {
    const result = await db.order.aggregate({
      where: {
        paymentStatus: 'PAID',
      },
      _sum: {
        grandTotal: true,
      },
    });
    return result._sum.grandTotal || 0;
  }

  async getTotalOrders(): Promise<number> {
    return db.order.count();
  }

  async getTotalCustomers(): Promise<number> {
    return db.user.count({
      where: {
        role: 'CUSTOMER',
      },
    });
  }

  async getTotalProducts(): Promise<number> {
    return db.product.count();
  }

  async getPendingOrdersCount(): Promise<number> {
    return db.order.count({
      where: {
        orderStatus: 'PENDING',
      },
    });
  }

  async getDeliveredOrdersCount(): Promise<number> {
    return db.order.count({
      where: {
        orderStatus: 'DELIVERED',
      },
    });
  }

  async getLowStockProductsCount(): Promise<number> {
    return db.product.count({
      where: {
        stock: {
          lt: 20,
        },
      },
    });
  }
}

export const adminRepository = new AdminRepository();

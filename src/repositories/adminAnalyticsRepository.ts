import { db } from '@/lib/db';

export class AdminAnalyticsRepository {
  async getRevenueStats(startDate?: Date, endDate?: Date) {
    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.gte = startDate;
      if (endDate) dateFilter.createdAt.lte = endDate;
    }

    const result = await db.order.aggregate({
      where: {
        paymentStatus: 'PAID',
        ...dateFilter,
      },
      _sum: {
        grandTotal: true,
      },
    });

    return result._sum.grandTotal || 0;
  }

  async getOrdersStats(startDate?: Date, endDate?: Date) {
    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.gte = startDate;
      if (endDate) dateFilter.createdAt.lte = endDate;
    }

    const totalOrders = await db.order.count({
      where: dateFilter,
    });

    const statusCounts = await db.order.groupBy({
      by: ['orderStatus'],
      where: dateFilter,
      _count: {
        id: true,
      },
    });

    const counts: Record<string, number> = {
      PENDING: 0,
      CONFIRMED: 0,
      PACKED: 0,
      OUT_FOR_DELIVERY: 0,
      DELIVERED: 0,
      CANCELLED: 0,
    };

    statusCounts.forEach((group) => {
      counts[group.orderStatus] = group._count.id;
    });

    return {
      totalOrders,
      ...counts,
    };
  }

  async getCustomersStats(startDate?: Date, endDate?: Date) {
    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.gte = startDate;
      if (endDate) dateFilter.createdAt.lte = endDate;
    }

    const totalCustomers = await db.user.count({
      where: {
        role: 'CUSTOMER',
      },
    });

    const newCustomers = await db.user.count({
      where: {
        role: 'CUSTOMER',
        ...dateFilter,
      },
    });

    // Repeat customers (have > 1 order lifetime)
    const repeatCustomersCount = await db.user.findMany({
      where: { role: 'CUSTOMER' },
      select: {
        _count: {
          select: { orders: true },
        },
      },
    });
    const repeatCustomers = repeatCustomersCount.filter((c) => c._count.orders > 1).length;

    // Active customers (placed at least 1 order in the filter period)
    const activeCustomersRaw = await db.order.groupBy({
      by: ['userId'],
      where: dateFilter,
    });
    const activeCustomers = activeCustomersRaw.length;

    return {
      totalCustomers,
      newCustomers,
      repeatCustomers,
      activeCustomers,
    };
  }

  async getProductsStats() {
    const totalProducts = await db.product.count();
    const lowStock = await db.product.count({
      where: {
        stock: { gt: 0, lte: 5 },
      },
    });
    const outOfStock = await db.product.count({
      where: {
        stock: 0,
      },
    });
    const activeProducts = await db.product.count({
      where: {
        category: { isActive: true },
      },
    });

    return {
      totalProducts,
      activeProducts,
      lowStock,
      outOfStock,
    };
  }

  async getCategoriesStats() {
    const totalCategories = await db.category.count();
    const activeCategories = await db.category.count({
      where: {
        isActive: true,
      },
    });

    return {
      totalCategories,
      activeCategories,
    };
  }

  async getPaymentsStats(startDate?: Date, endDate?: Date) {
    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.gte = startDate;
      if (endDate) dateFilter.createdAt.lte = endDate;
    }

    const [cod, razorpay, paid, failed, refunded] = await Promise.all([
      db.order.count({ where: { paymentMethod: 'COD', ...dateFilter } }),
      db.order.count({ where: { paymentMethod: 'RAZORPAY', ...dateFilter } }),
      db.order.count({ where: { paymentStatus: 'PAID', ...dateFilter } }),
      db.order.count({ where: { paymentStatus: 'FAILED', ...dateFilter } }),
      db.order.count({ where: { paymentStatus: 'REFUNDED', ...dateFilter } }),
    ]);

    return {
      cod,
      razorpay,
      paid,
      failed,
      refunded,
    };
  }

  async getTopSellingProducts(limit = 5, startDate?: Date, endDate?: Date) {
    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.gte = startDate;
      if (endDate) dateFilter.createdAt.lte = endDate;
    }

    const orderItems = await db.orderItem.findMany({
      where: {
        order: {
          paymentStatus: 'PAID',
          ...dateFilter,
        },
      },
      select: {
        productId: true,
        productName: true,
        productImage: true,
        quantity: true,
        totalPrice: true,
        product: {
          select: {
            stock: true,
          },
        },
      },
    });

    const productMap = new Map<string, { name: string; image: string; quantity: number; revenue: number; stock: number }>();
    for (const item of orderItems) {
      const existing = productMap.get(item.productId);
      const stock = item.product?.stock ?? 0;
      if (existing) {
        existing.quantity += item.quantity;
        existing.revenue += item.totalPrice;
      } else {
        productMap.set(item.productId, {
          name: item.productName,
          image: item.productImage,
          quantity: item.quantity,
          revenue: item.totalPrice,
          stock,
        });
      }
    }

    return Array.from(productMap.entries())
      .map(([id, stats]) => ({
        id,
        ...stats,
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, limit);
  }

  async getTopSellingCategories(limit = 5, startDate?: Date, endDate?: Date) {
    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.gte = startDate;
      if (endDate) dateFilter.createdAt.lte = endDate;
    }

    const orderItems = await db.orderItem.findMany({
      where: {
        order: {
          paymentStatus: 'PAID',
          ...dateFilter,
        },
      },
      select: {
        totalPrice: true,
        orderId: true,
        product: {
          select: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    const categoryMap = new Map<string, { name: string; revenue: number; ordersSet: Set<string> }>();
    for (const item of orderItems) {
      const cat = item.product?.category;
      if (!cat) continue;

      const existing = categoryMap.get(cat.id);
      if (existing) {
        existing.revenue += item.totalPrice;
        existing.ordersSet.add(item.orderId);
      } else {
        const ordersSet = new Set<string>();
        ordersSet.add(item.orderId);
        categoryMap.set(cat.id, {
          name: cat.name,
          revenue: item.totalPrice,
          ordersSet,
        });
      }
    }

    return Array.from(categoryMap.entries())
      .map(([id, stats]) => ({
        id,
        name: stats.name,
        revenue: stats.revenue,
        ordersCount: stats.ordersSet.size,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);
  }

  async getOrdersTrend(startDate: Date, endDate: Date) {
    return db.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        grandTotal: true,
        createdAt: true,
        paymentStatus: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async getCustomersTrend(startDate: Date, endDate: Date) {
    return db.user.findMany({
      where: {
        role: 'CUSTOMER',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }
}

export const adminAnalyticsRepository = new AdminAnalyticsRepository();

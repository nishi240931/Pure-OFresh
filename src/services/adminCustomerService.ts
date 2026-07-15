import { adminCustomerRepository } from '@/repositories/adminCustomerRepository';

export interface CustomerDto {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  profileImage: string | null;
  registrationDate: string;
  totalOrders: number;
  totalSpending: number; // LTV
  averageOrderValue: number;
  lastOrderDate: string | null;
}

export class AdminCustomerService {
  async getCustomerList(params: {
    search?: string;
    page: number;
    limit: number;
    sort: 'newest' | 'oldest' | 'highest_spending' | 'most_orders';
  }) {
    const { search, page, limit, sort } = params;
    const users = await adminCustomerRepository.getCustomersWithOrders({ search });

    // Map to DTOs and aggregate combined totals
    let combinedLtv = 0;
    let combinedOrdersCount = 0;

    const customerDtos: CustomerDto[] = users.map((user) => {
      const orders = user.orders || [];
      const paidOrders = orders.filter((o) => o.paymentStatus === 'PAID');
      const totalSpending = paidOrders.reduce((sum, o) => sum + o.grandTotal, 0); // LTV
      const totalOrders = orders.length;
      const averageOrderValue = totalOrders > 0 ? (orders.reduce((sum, o) => sum + o.grandTotal, 0) / totalOrders) : 0;
      
      combinedLtv += totalSpending;
      combinedOrdersCount += totalOrders;

      let lastOrderDate: string | null = null;
      if (orders.length > 0) {
        const sortedOrders = [...orders].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        lastOrderDate = sortedOrders[0].createdAt.toISOString();
      }

      return {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
        registrationDate: user.createdAt.toISOString(),
        totalOrders,
        totalSpending,
        averageOrderValue,
        lastOrderDate,
      };
    });

    // Sort DTOs
    if (sort === 'newest') {
      customerDtos.sort((a, b) => new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime());
    } else if (sort === 'oldest') {
      customerDtos.sort((a, b) => new Date(a.registrationDate).getTime() - new Date(b.registrationDate).getTime());
    } else if (sort === 'highest_spending') {
      customerDtos.sort((a, b) => b.totalSpending - a.totalSpending);
    } else if (sort === 'most_orders') {
      customerDtos.sort((a, b) => b.totalOrders - a.totalOrders);
    }

    // Paginate
    const totalCount = customerDtos.length;
    const totalPages = Math.ceil(totalCount / limit);
    const skip = (page - 1) * limit;
    const paginatedCustomers = customerDtos.slice(skip, skip + limit);

    return {
      customers: paginatedCustomers,
      totalCount,
      totalPages,
      currentPage: page,
      summary: {
        totalCustomersCount: totalCount,
        totalLifetimeValue: combinedLtv,
        averageOrdersPerCustomer: totalCount > 0 ? (combinedOrdersCount / totalCount) : 0,
      },
    };
  }

  async getCustomerDetails(id: string) {
    const user = await adminCustomerRepository.getCustomerById(id);
    if (!user || user.role !== 'CUSTOMER') {
      throw new Error('Customer not found.');
    }

    const orders = user.orders || [];
    const paidOrders = orders.filter((o) => o.paymentStatus === 'PAID');
    const totalSpending = paidOrders.reduce((sum, o) => sum + o.grandTotal, 0); // LTV
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? (orders.reduce((sum, o) => sum + o.grandTotal, 0) / totalOrders) : 0;
    
    let lastOrderDate: string | null = null;
    if (orders.length > 0) {
      lastOrderDate = orders[0].createdAt.toISOString();
    }

    return {
      profile: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
        registrationDate: user.createdAt.toISOString(),
      },
      stats: {
        totalOrders,
        totalSpending, // LTV
        averageOrderValue,
        lastOrderDate,
      },
      addresses: user.addresses || [],
      recentOrders: orders.slice(0, 5), // Return 5 most recent orders
    };
  }
}

export const adminCustomerService = new AdminCustomerService();

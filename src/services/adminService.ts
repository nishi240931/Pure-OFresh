import { adminRepository } from '@/repositories/adminRepository';

export interface DashboardMetricsDto {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  newCustomers?: number;
  repeatCustomers?: number;
  totalProducts: number;
  pendingOrders: number;
  deliveredOrders: number;
  lowStockProducts: number;
}

export class AdminService {
  async getDashboardStats(): Promise<DashboardMetricsDto> {
    try {
      const [
        totalRevenue,
        totalOrders,
        totalCustomers,
        newCustomers,
        repeatCustomers,
        totalProducts,
        pendingOrders,
        deliveredOrders,
        lowStockProducts,
      ] = await Promise.all([
        adminRepository.getTotalRevenue(),
        adminRepository.getTotalOrders(),
        adminRepository.getTotalCustomers(),
        adminRepository.getNewCustomersCount(),
        adminRepository.getRepeatCustomersCount(),
        adminRepository.getTotalProducts(),
        adminRepository.getPendingOrdersCount(),
        adminRepository.getDeliveredOrdersCount(),
        adminRepository.getLowStockProductsCount(),
      ]);

      return {
        totalRevenue,
        totalOrders,
        totalCustomers,
        newCustomers,
        repeatCustomers,
        totalProducts,
        pendingOrders,
        deliveredOrders,
        lowStockProducts,
      };
    } catch (err: any) {
      console.error('Failed to aggregate admin dashboard stats:', err);
      throw new Error(err.message || 'Failed to aggregate dashboard metrics.');
    }
  }
}

export const adminService = new AdminService();

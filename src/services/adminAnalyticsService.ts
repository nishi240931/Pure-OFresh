import { adminAnalyticsRepository } from '@/repositories/adminAnalyticsRepository';

export class AdminAnalyticsService {
  private getPeriodDates(period: string, customStart?: string, customEnd?: string) {
    const now = new Date();
    let startDate = new Date();
    let endDate = new Date();
    let prevStartDate = new Date();
    let prevEndDate = new Date();

    switch (period) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        
        prevStartDate.setDate(prevStartDate.getDate() - 1);
        prevStartDate.setHours(0, 0, 0, 0);
        prevEndDate.setDate(prevEndDate.getDate() - 1);
        prevEndDate.setHours(23, 59, 59, 999);
        break;

      case 'week':
        startDate.setDate(startDate.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);
        
        prevStartDate.setDate(prevStartDate.getDate() - 13);
        prevStartDate.setHours(0, 0, 0, 0);
        prevEndDate.setDate(prevEndDate.getDate() - 7);
        prevEndDate.setHours(23, 59, 59, 999);
        break;

      case 'month':
        startDate.setDate(startDate.getDate() - 29);
        startDate.setHours(0, 0, 0, 0);

        prevStartDate.setDate(prevStartDate.getDate() - 59);
        prevStartDate.setHours(0, 0, 0, 0);
        prevEndDate.setDate(prevEndDate.getDate() - 30);
        prevEndDate.setHours(23, 59, 59, 999);
        break;

      case 'this_month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        
        const daysInMonth = now.getDate();
        prevStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
        prevEndDate = new Date(now.getFullYear(), now.getMonth() - 1, daysInMonth, 23, 59, 59, 999);
        break;

      case 'this_year':
        startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);

        prevStartDate = new Date(now.getFullYear() - 1, 0, 1, 0, 0, 0, 0);
        prevEndDate = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
        break;

      case 'custom':
        if (customStart) startDate = new Date(customStart);
        if (customEnd) endDate = new Date(customEnd);
        
        // Match duration for historical comparison
        const diffMs = endDate.getTime() - startDate.getTime();
        prevStartDate = new Date(startDate.getTime() - diffMs - 1);
        prevEndDate = new Date(startDate.getTime() - 1);
        break;

      default: // Default to last 30 days
        startDate.setDate(startDate.getDate() - 29);
        startDate.setHours(0, 0, 0, 0);
        prevStartDate.setDate(prevStartDate.getDate() - 59);
        prevStartDate.setHours(0, 0, 0, 0);
        prevEndDate.setDate(prevEndDate.getDate() - 30);
        prevEndDate.setHours(23, 59, 59, 999);
        break;
    }

    return {
      startDate,
      endDate,
      prevStartDate,
      prevEndDate,
    };
  }

  private calculateGrowth(current: number, previous: number): number {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }
    return Math.round(((current - previous) / previous) * 100);
  }

  async getDashboardSummary(params: {
    interval: string;
    customStart?: string;
    customEnd?: string;
  }) {
    const { interval, customStart, customEnd } = params;
    const { startDate, endDate, prevStartDate, prevEndDate } = this.getPeriodDates(interval, customStart, customEnd);

    // Fetch current statistics
    const [
      revenue,
      orders,
      customers,
      products,
      categories,
      payments,
      topProducts,
      topCategories,
    ] = await Promise.all([
      adminAnalyticsRepository.getRevenueStats(startDate, endDate),
      adminAnalyticsRepository.getOrdersStats(startDate, endDate),
      adminAnalyticsRepository.getCustomersStats(startDate, endDate),
      adminAnalyticsRepository.getProductsStats(),
      adminAnalyticsRepository.getCategoriesStats(),
      adminAnalyticsRepository.getPaymentsStats(startDate, endDate),
      adminAnalyticsRepository.getTopSellingProducts(5, startDate, endDate),
      adminAnalyticsRepository.getTopSellingCategories(5, startDate, endDate),
    ]);

    // Fetch historical comparison data
    const [prevRevenue, prevOrders, prevCustomers] = await Promise.all([
      adminAnalyticsRepository.getRevenueStats(prevStartDate, prevEndDate),
      adminAnalyticsRepository.getOrdersStats(prevStartDate, prevEndDate),
      adminAnalyticsRepository.getCustomersStats(prevStartDate, prevEndDate),
    ]);

    // Derived Financial KPIs
    const aov = payments.paid > 0 ? revenue / payments.paid : 0;
    const customerLtv = customers.totalCustomers > 0 ? revenue / customers.totalCustomers : 0;

    // Derived growth percentages
    const revenueGrowth = this.calculateGrowth(revenue, prevRevenue);
    const ordersGrowth = this.calculateGrowth(orders.totalOrders, prevOrders.totalOrders);
    const customersGrowth = this.calculateGrowth(customers.newCustomers, prevCustomers.newCustomers);

    // Summary DTO
    return {
      summary: {
        revenue,
        revenueGrowth,
        totalOrders: orders.totalOrders,
        ordersGrowth,
        newCustomers: customers.newCustomers,
        customersGrowth,
        totalCustomers: customers.totalCustomers,
        totalProducts: products.totalProducts,
        aov,
        customerLtv,
      },
      sales: {
        revenue,
        prevRevenue,
        revenueGrowth,
      },
      customers,
      products,
      categories,
      orders,
      payments,
      topProducts,
      topCategories,
    };
  }

  async getChartTrends(params: {
    period: string;
    customStart?: string;
    customEnd?: string;
  }) {
    const { period, customStart, customEnd } = params;
    const { startDate, endDate } = this.getPeriodDates(period, customStart, customEnd);

    // Fetch active listings for trends
    const [ordersTrend, customersTrend, topProducts, topCategories] = await Promise.all([
      adminAnalyticsRepository.getOrdersTrend(startDate, endDate),
      adminAnalyticsRepository.getCustomersTrend(startDate, endDate),
      adminAnalyticsRepository.getTopSellingProducts(5, startDate, endDate),
      adminAnalyticsRepository.getTopSellingCategories(5, startDate, endDate),
    ]);

    const revenueTrendData: Record<string, number> = {};
    const ordersTrendData: Record<string, number> = {};
    const customersTrendData: Record<string, number> = {};

    // Grouping timelines based on selected period
    if (period === 'today') {
      // 24 Hour points
      for (let i = 0; i < 24; i++) {
        const key = `${i.toString().padStart(2, '0')}:00`;
        revenueTrendData[key] = 0;
        ordersTrendData[key] = 0;
        customersTrendData[key] = 0;
      }

      ordersTrend.forEach((order) => {
        const hour = new Date(order.createdAt).getHours();
        const key = `${hour.toString().padStart(2, '0')}:00`;
        if (order.paymentStatus === 'PAID') {
          revenueTrendData[key] = (revenueTrendData[key] ?? 0) + order.grandTotal;
        }
        ordersTrendData[key] = (ordersTrendData[key] ?? 0) + 1;
      });

      customersTrend.forEach((cust) => {
        const hour = new Date(cust.createdAt).getHours();
        const key = `${hour.toString().padStart(2, '0')}:00`;
        customersTrendData[key] = (customersTrendData[key] ?? 0) + 1;
      });
    } else if (period === 'this_year') {
      // Monthly points
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      months.forEach((m) => {
        revenueTrendData[m] = 0;
        ordersTrendData[m] = 0;
        customersTrendData[m] = 0;
      });

      ordersTrend.forEach((order) => {
        const mIdx = new Date(order.createdAt).getMonth();
        const key = months[mIdx];
        if (order.paymentStatus === 'PAID') {
          revenueTrendData[key] = (revenueTrendData[key] ?? 0) + order.grandTotal;
        }
        ordersTrendData[key] = (ordersTrendData[key] ?? 0) + 1;
      });

      customersTrend.forEach((cust) => {
        const mIdx = new Date(cust.createdAt).getMonth();
        const key = months[mIdx];
        customersTrendData[key] = (customersTrendData[key] ?? 0) + 1;
      });
    } else {
      // Daily points (last 7 days, 30 days, or custom)
      const dayDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      for (let i = 0; i <= dayDiff; i++) {
        const tempDate = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
        const key = tempDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        revenueTrendData[key] = 0;
        ordersTrendData[key] = 0;
        customersTrendData[key] = 0;
      }

      ordersTrend.forEach((order) => {
        const key = new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        if (revenueTrendData[key] !== undefined) {
          if (order.paymentStatus === 'PAID') {
            revenueTrendData[key] += order.grandTotal;
          }
          ordersTrendData[key] += 1;
        }
      });

      customersTrend.forEach((cust) => {
        const key = new Date(cust.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        if (customersTrendData[key] !== undefined) {
          customersTrendData[key] += 1;
        }
      });
    }

    const formattedRevenue = Object.entries(revenueTrendData).map(([name, value]) => ({ name, value }));
    const formattedOrders = Object.entries(ordersTrendData).map(([name, value]) => ({ name, value }));
    const formattedCustomers = Object.entries(customersTrendData).map(([name, value]) => ({ name, value }));

    return {
      revenueTrend: formattedRevenue,
      ordersTrend: formattedOrders,
      customerGrowth: formattedCustomers,
      topProducts,
      topCategories,
    };
  }
}

export const adminAnalyticsService = new AdminAnalyticsService();

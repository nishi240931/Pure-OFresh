'use client';

import React, { useState, useEffect } from 'react';
import {
  Download,
  Loader2,
  TrendingUp,
  ShoppingBag,
  Users,
  Package,
  RefreshCw,
  TrendingDown,
  ChevronRight,
  FileSpreadsheet,
  AlertTriangle
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { useHydrated } from '@/hooks/useHydrated';

interface ChartPoint {
  name: string;
  value: number;
}

interface TopProduct {
  id: string;
  name: string;
  image: string;
  quantity: number;
  revenue: number;
  stock: number;
}

interface TopCategory {
  id: string;
  name: string;
  revenue: number;
  ordersCount: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  grandTotal: number;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
  user: {
    fullName: string;
    email: string;
  };
}

interface AnalyticsData {
  summary: {
    revenue: number;
    revenueGrowth: number;
    totalOrders: number;
    ordersGrowth: number;
    newCustomers: number;
    customersGrowth: number;
    totalCustomers: number;
    totalProducts: number;
    aov: number;
    customerLtv: number;
  };
  sales: {
    revenue: number;
    prevRevenue: number;
    revenueGrowth: number;
  };
  customers: {
    totalCustomers: number;
    newCustomers: number;
    repeatCustomers: number;
    activeCustomers: number;
  };
  products: {
    totalProducts: number;
    activeProducts: number;
    lowStock: number;
    outOfStock: number;
  };
  categories: {
    totalCategories: number;
    activeCategories: number;
  };
  orders: {
    totalOrders: number;
    PENDING: number;
    CONFIRMED: number;
    PACKED: number;
    OUT_FOR_DELIVERY: number;
    DELIVERED: number;
    CANCELLED: number;
  };
  payments: {
    cod: number;
    razorpay: number;
    paid: number;
    failed: number;
    refunded: number;
  };
  topProducts: TopProduct[];
  topCategories: TopCategory[];
}

interface ChartData {
  revenueTrend: ChartPoint[];
  ordersTrend: ChartPoint[];
  customerGrowth: ChartPoint[];
  topProducts: TopProduct[];
  topCategories: TopCategory[];
}

export default function AdminAnalyticsPage() {
  const isHydrated = useHydrated();

  // Filters State
  const [interval, setIntervalVal] = useState('month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // Data Loading States
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [charts, setCharts] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [exporting, setExporting] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({
        interval,
        ...(interval === 'custom' && customStart && { customStart }),
        ...(interval === 'custom' && customEnd && { customEnd }),
      });

      const chartsQueryParams = new URLSearchParams({
        period: interval,
        ...(interval === 'custom' && customStart && { customStart }),
        ...(interval === 'custom' && customEnd && { customEnd }),
      });

      // Parallel API Retrieval
      const [resSummary, resCharts, resRecent] = await Promise.all([
        fetch(`/api/admin/analytics/dashboard?${queryParams.toString()}`),
        fetch(`/api/admin/analytics/charts?${chartsQueryParams.toString()}`),
        fetch('/api/admin/orders?page=1&limit=5')
      ]);

      const dataSummary = await resSummary.json();
      const dataCharts = await resCharts.json();
      const dataRecent = await resRecent.json();

      if (dataSummary.success && dataCharts.success) {
        setData(dataSummary.data);
        setCharts(dataCharts.data);
        if (dataRecent.success && dataRecent.data) {
          setRecentOrders(dataRecent.data.orders);
        }
      } else {
        setError(dataSummary.message || dataCharts.message || 'Failed to load analytics.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error occurred while retrieving analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isHydrated) {
      fetchAnalytics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated, interval]);

  if (!isHydrated) {
    return null;
  }

  // Formatting Helpers
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const formatDate = (isoStr: string) => {
    return new Date(isoStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getOrderStatusStyles = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-50 text-amber-700 border-amber-250/50';
      case 'CONFIRMED': return 'bg-blue-50 text-blue-700 border-blue-250/50';
      case 'PACKED': return 'bg-violet-50 text-violet-700 border-violet-250/50';
      case 'OUT_FOR_DELIVERY': return 'bg-orange-50 text-orange-700 border-orange-250/50';
      case 'DELIVERED': return 'bg-emerald-50 text-emerald-700 border-emerald-250/50';
      case 'CANCELLED': return 'bg-rose-50 text-rose-700 border-rose-250/50';
      default: return 'bg-slate-50 text-slate-700 border-slate-205/50';
    }
  };

  // CSV and Excel Export Handlers
  const handleExport = async (type: 'revenue' | 'orders' | 'customers' | 'products', format: 'csv' | 'excel') => {
    setExporting(type);
    try {
      let headers: string[] = [];
      let rows: string[][] = [];
      const filename = `${type}_report_${new Date().toISOString().slice(0, 10)}`;

      if (type === 'revenue') {
        headers = ['Timeline Point', 'Paid Revenue (INR)', 'Submitted Orders Count'];
        rows = (charts?.revenueTrend ?? []).map((point, index) => {
          const orderPoint = charts?.ordersTrend[index];
          return [point.name, point.value.toString(), orderPoint ? orderPoint.value.toString() : '0'];
        });
      } else if (type === 'orders') {
        headers = ['Order ID', 'Grand Total (INR)', 'Order Status', 'Payment Status', 'Payment Method', 'Creation Date'];
        
        // Fetch full order dataset for report
        const res = await fetch('/api/admin/orders?page=1&limit=100');
        const ordersData = await res.json();
        const ordersList = ordersData.data?.orders || [];
        rows = ordersList.map((o: any) => [
          o.orderNumber,
          o.grandTotal.toString(),
          o.orderStatus,
          o.paymentStatus,
          o.paymentMethod,
          formatDate(o.createdAt)
        ]);
      } else if (type === 'customers') {
        headers = ['User Name', 'Email Address', 'Phone', 'Registration Date', 'Submitted Orders Count', 'Settled Spend (INR)'];
        
        const res = await fetch('/api/admin/customers?page=1&limit=100');
        const customersData = await res.json();
        const customersList = customersData.data?.customers || [];
        rows = customersList.map((c: any) => [
          c.fullName,
          c.email,
          c.phone || 'No phone',
          formatDate(c.registrationDate),
          c.totalOrders.toString(),
          c.totalSpending.toString()
        ]);
      } else if (type === 'products') {
        headers = ['SKU', 'Product Name', 'Pricing (INR)', 'Current Stock', 'Organic Status', 'Rating'];
        
        const res = await fetch('/api/products?limit=100');
        const productsData = await res.json();
        const productsList = productsData.data?.products || [];
        rows = productsList.map((p: any) => [
          p.sku || 'No SKU',
          p.name,
          p.price.toString(),
          p.stock.toString(),
          p.isOrganic ? 'ORGANIC' : 'CONVENTIONAL',
          p.rating.toString()
        ]);
      }

      if (format === 'csv') {
        // Render CSV
        const csvContent = [
          headers.join(','),
          ...rows.map(row => row.map(cell => {
            const cleanCell = cell ? cell.toString().replace(/"/g, '""') : '';
            return cleanCell.includes(',') || cleanCell.includes('\n') || cleanCell.includes('"') 
              ? `"${cleanCell}"` 
              : cleanCell;
          }).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Render Excel Spreadsheet HTML natively
        let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">`;
        html += `<head><meta charset="utf-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Analytics Report</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body>`;
        html += `<table><thead><tr>`;
        headers.forEach(h => { html += `<th style="background-color: #f1f5f9; font-weight: bold; border: 1px solid #cbd5e1;">${h}</th>`; });
        html += `</tr></thead><tbody>`;
        rows.forEach(row => {
          html += `<tr>`;
          row.forEach(cell => { html += `<td style="border: 1px solid #e2e8f0;">${cell ?? ''}</td>`; });
          html += `</tr>`;
        });
        html += `</tbody></table></body></html>`;

        const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.xls`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err: any) {
      alert(`Export failed: ${err.message}`);
    } finally {
      setExporting(null);
    }
  };



  return (
    <div className="space-y-6">

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold font-display text-slate-800 tracking-tight">Analytics Dashboard</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">Aggregate catalog metrics, revenue growth charts, and payment distribution trends</p>
        </div>

        {/* Dynamic filter controls */}
        <div className="flex flex-wrap items-center gap-2">
          {interval === 'custom' && (
            <div className="flex items-center gap-1">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-[10px] font-bold text-slate-700 bg-white"
              />
              <span className="text-[10px] text-slate-400 font-bold">to</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-[10px] font-bold text-slate-700 bg-white"
              />
              <button
                onClick={fetchAnalytics}
                className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-bold"
              >
                Apply
              </button>
            </div>
          )}

          <select
            value={interval}
            onChange={(e) => {
              setIntervalVal(e.target.value);
            }}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none text-xs font-bold text-slate-700 bg-white shadow-sm"
          >
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="this_month">This Month</option>
            <option value="this_year">This Year</option>
            <option value="custom">Custom Date Range</option>
          </select>

          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl shadow-sm transition disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* ERROR CARD */}
      {error && (
        <div className="p-5 bg-rose-50 border border-rose-100 text-rose-800 rounded-3xl flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold">Failed to load analytics summaries</p>
            <p className="text-[11px] text-rose-600/90 font-medium mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && !data ? (
        <div className="flex flex-col items-center justify-center py-40 gap-3 bg-white rounded-3xl border border-slate-200/60 shadow-sm">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Aggregating database summaries...</p>
        </div>
      ) : data && charts ? (
        <>
          {/* TOP KPI SUMMARY CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1: Revenue */}
            <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm flex flex-col justify-between min-h-[120px]">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Paid Revenue</span>
                <div className="h-9 w-9 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-100/50">
                  <TrendingUp className="h-4.5 w-4.5" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl font-black font-display text-slate-800">{formatCurrency(data.summary.revenue)}</h3>
                <p className={`text-[10px] font-bold mt-1 flex items-center gap-1 ${data.summary.revenueGrowth >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {data.summary.revenueGrowth >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  <span>{data.summary.revenueGrowth}% compared to previous</span>
                </p>
              </div>
            </div>

            {/* Card 2: Orders */}
            <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm flex flex-col justify-between min-h-[120px]">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Orders</span>
                <div className="h-9 w-9 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center border border-blue-100/50">
                  <ShoppingBag className="h-4.5 w-4.5" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl font-black font-display text-slate-800">{data.summary.totalOrders}</h3>
                <p className={`text-[10px] font-bold mt-1 flex items-center gap-1 ${data.summary.ordersGrowth >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {data.summary.ordersGrowth >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  <span>{data.summary.ordersGrowth}% compared to previous</span>
                </p>
              </div>
            </div>

            {/* Card 3: Customers */}
            <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm flex flex-col justify-between min-h-[120px]">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">New Registrations</span>
                <div className="h-9 w-9 bg-violet-50 text-violet-650 rounded-full flex items-center justify-center border border-violet-100/50">
                  <Users className="h-4.5 w-4.5" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl font-black font-display text-slate-800">{data.summary.newCustomers}</h3>
                <p className={`text-[10px] font-bold mt-1 flex items-center gap-1 ${data.summary.customersGrowth >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {data.summary.customersGrowth >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  <span>{data.summary.customersGrowth}% compared to previous</span>
                </p>
              </div>
            </div>

            {/* Card 4: Products */}
            <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm flex flex-col justify-between min-h-[120px]">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AOV / LTV</span>
                <div className="h-9 w-9 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center border border-amber-100/50">
                  <Package className="h-4.5 w-4.5" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-sm font-black font-display text-slate-800">
                  AOV: <span className="text-slate-900">{formatCurrency(data.summary.aov)}</span>
                </h3>
                <p className="text-[10px] font-bold text-slate-400 mt-1">
                  Avg. Lifetime Value: {formatCurrency(data.summary.customerLtv)}
                </p>
              </div>
            </div>

          </div>

          {/* MAIN CHARTS SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Chart 1: Revenue Line Chart */}
            <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm space-y-4">
              <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Revenue Trend (INR)</h4>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={charts.revenueTrend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Revenue']} />
                    <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Orders Bar Chart */}
            <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm space-y-4">
              <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Orders Submitted Trend</h4>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.ordersTrend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <Tooltip formatter={(value) => [value, 'Orders']} />
                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 3: Payment Distribution Pie Chart */}
            <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm flex flex-col justify-between">
              <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-4">Payment Method Breakdown</h4>
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Razorpay', value: data.payments.razorpay },
                        { name: 'COD', value: data.payments.cod }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      <Cell fill="#3b82f6" />
                      <Cell fill="#f59e0b" />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 4: Customer Growth Area Chart */}
            <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm space-y-4">
              <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Customer Growth Trend</h4>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={charts.customerGrowth}>
                    <defs>
                      <linearGradient id="colorCust" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <Tooltip formatter={(value) => [value, 'New Customers']} />
                    <Area type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorCust)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* TABLES & TOP PERFORMERS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Top Products Table */}
            <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Top Selling Products</h4>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleExport('products', 'csv')}
                    disabled={exporting !== null}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[9px] font-bold flex items-center gap-1 transition disabled:opacity-50"
                  >
                    <Download className="h-3 w-3" /> CSV
                  </button>
                  <button
                    onClick={() => handleExport('products', 'excel')}
                    disabled={exporting !== null}
                    className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-[9px] font-bold flex items-center gap-1 transition disabled:opacity-50"
                  >
                    <FileSpreadsheet className="h-3 w-3" /> Excel
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-semibold text-slate-650">
                  <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-2.5">Product</th>
                      <th className="px-4 py-2.5">Units Sold</th>
                      <th className="px-4 py-2.5">Revenue</th>
                      <th className="px-4 py-2.5 text-right">Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.topProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 flex items-center gap-2">
                          <img src={p.image} alt="" className="h-7 w-7 rounded-lg object-cover border border-slate-100" />
                          <span className="font-bold text-slate-800 truncate max-w-[150px]">{p.name}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-500 font-extrabold">{p.quantity} units</td>
                        <td className="px-4 py-3 text-slate-900 font-bold">{formatCurrency(p.revenue)}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${p.stock <= 5 ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-700'}`}>
                            {p.stock} left
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Categories Table */}
            <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm space-y-4">
              <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Top Performing Categories</h4>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-semibold text-slate-650">
                  <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-2.5">Category</th>
                      <th className="px-4 py-2.5">Paid Revenue</th>
                      <th className="px-4 py-2.5 text-right">Orders Filled</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.topCategories.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-bold text-slate-800">{c.name}</td>
                        <td className="px-4 py-3 text-slate-900 font-bold">{formatCurrency(c.revenue)}</td>
                        <td className="px-4 py-3 text-right text-slate-500 font-extrabold">{c.ordersCount} orders</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* EXPORTS & REPORT GENERATIONS SECTION */}
          <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm space-y-4">
            <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Administrative Export Reports</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Export Item 1: Revenue report */}
              <div className="p-4 border border-slate-100 rounded-2xl flex flex-col justify-between gap-3 bg-slate-50/50">
                <div>
                  <h5 className="text-xs font-bold text-slate-800">Settled Revenue Report</h5>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Timeline points with paid totals</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleExport('revenue', 'csv')}
                    disabled={exporting !== null}
                    className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 transition"
                  >
                    CSV
                  </button>
                  <button
                    onClick={() => handleExport('revenue', 'excel')}
                    disabled={exporting !== null}
                    className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 transition"
                  >
                    Excel
                  </button>
                </div>
              </div>

              {/* Export Item 2: Orders report */}
              <div className="p-4 border border-slate-100 rounded-2xl flex flex-col justify-between gap-3 bg-slate-50/50">
                <div>
                  <h5 className="text-xs font-bold text-slate-800">Order Logs Report</h5>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Details of up to 100 recent orders</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleExport('orders', 'csv')}
                    disabled={exporting !== null}
                    className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 transition"
                  >
                    CSV
                  </button>
                  <button
                    onClick={() => handleExport('orders', 'excel')}
                    disabled={exporting !== null}
                    className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 transition"
                  >
                    Excel
                  </button>
                </div>
              </div>

              {/* Export Item 3: Customers report */}
              <div className="p-4 border border-slate-100 rounded-2xl flex flex-col justify-between gap-3 bg-slate-50/50">
                <div>
                  <h5 className="text-xs font-bold text-slate-800">Customer Profiles Report</h5>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Client list, registration dates, LTV</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleExport('customers', 'csv')}
                    disabled={exporting !== null}
                    className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 transition"
                  >
                    CSV
                  </button>
                  <button
                    onClick={() => handleExport('customers', 'excel')}
                    disabled={exporting !== null}
                    className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 transition"
                  >
                    Excel
                  </button>
                </div>
              </div>

              {/* Export Item 4: Products report */}
              <div className="p-4 border border-slate-100 rounded-2xl flex flex-col justify-between gap-3 bg-slate-50/50">
                <div>
                  <h5 className="text-xs font-bold text-slate-800">Catalog Inventory Report</h5>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Product SKUs, pricing, stock levels</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleExport('products', 'csv')}
                    disabled={exporting !== null}
                    className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 transition"
                  >
                    CSV
                  </button>
                  <button
                    onClick={() => handleExport('products', 'excel')}
                    disabled={exporting !== null}
                    className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 transition"
                  >
                    Excel
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* RECENT ORDERS TABLE */}
          <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Recent Orderssubmitted</h4>
              <a href="/admin/orders" className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5">
                Manage Orders <ChevronRight className="h-3 w-3" />
              </a>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold text-slate-650">
                <thead className="bg-slate-50/75 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">Order Number</th>
                    <th className="px-6 py-3.5">Customer</th>
                    <th className="px-6 py-3.5">Grand Total</th>
                    <th className="px-6 py-3.5">Order Status</th>
                    <th className="px-6 py-3.5">Payment</th>
                    <th className="px-6 py-3.5 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80">
                  {recentOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50/50 transition duration-150">
                      <td className="px-6 py-4 font-bold text-slate-800">
                        #{o.orderNumber}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800">{o.user?.fullName}</div>
                        <div className="text-[10px] text-slate-400 font-semibold">{o.user?.email}</div>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {formatCurrency(o.grandTotal)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border tracking-wider ${getOrderStatusStyles(o.orderStatus)}`}>
                          {o.orderStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border ${o.paymentStatus === 'PAID' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                          {o.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-slate-400 text-[11px]">
                        {formatDate(o.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}

    </div>
  );
}

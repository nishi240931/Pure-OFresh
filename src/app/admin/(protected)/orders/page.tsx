'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  Calendar, 
  MapPin, 
  User, 
  CreditCard, 
  AlertTriangle,
  Loader2,
  X,
  CheckCircle,
  Truck,
  Package,
  TrendingUp,
  Clock,
  RefreshCw
} from 'lucide-react';
import { useHydrated } from '@/hooks/useHydrated';

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  subtotal: number;
  discount: number;
  couponDiscount: number;
  deliveryFee: number;
  gst: number;
  grandTotal: number;
  paymentStatus: string;
  orderStatus: string;
  paymentMethod: string;
  deliverySlot: string | null;
  couponCode: string | null;
  notes: string | null;
  paymentCompletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    fullName: string;
    email: string;
    profileImage: string | null;
  };
  address: {
    fullName: string;
    phone: string;
    streetAddress: string;
    city: string;
    state: string;
    postalCode: string;
  };
  items: OrderItem[];
}

export default function AdminOrdersPage() {
  const isHydrated = useHydrated();
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  
  // Selected Order for Drawer
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingPayment, setUpdatingPayment] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '8',
        sort: sortOrder,
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
        ...(paymentFilter && { paymentStatus: paymentFilter }),
      });

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      const data = await res.json();
      if (data.success && data.data) {
        setOrders(data.data.orders);
        setTotalCount(data.data.totalCount);
        setTotalPages(data.data.totalPages);
      } else {
        setError(data.message || 'Failed to fetch orders.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error occurred while fetching orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isHydrated) {
      fetchOrders();
    }
  }, [isHydrated, currentPage, statusFilter, paymentFilter, sortOrder]);
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchOrders();
  };

  const handleViewOrder = async (id: string) => {
    setActionError(null);
    try {
      const res = await fetch(`/api/admin/orders/${id}`);
      const data = await res.json();
      if (data.success && data.data) {
        setSelectedOrder(data.data);
      } else {
        alert(data.message || 'Failed to retrieve order details.');
      }
    } catch (err: any) {
      alert(err.message || 'Error fetching order details.');
    }
  };

  useEffect(() => {
    if (isHydrated) {
      const searchParams = new URLSearchParams(window.location.search);
      const orderId = searchParams.get('orderId');
      if (orderId) {
        handleViewOrder(orderId);
      }
    }
  }, [isHydrated]);

  const handleUpdateStatus = async (targetStatus: string) => {
    if (!selectedOrder) return;
    setUpdatingStatus(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: targetStatus }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        // Refresh detail view
        await handleViewOrder(selectedOrder.id);
        // Refresh list
        fetchOrders();
      } else {
        setActionError(data.message || 'Failed to update order status.');
      }
    } catch (err: any) {
      setActionError(err.message || 'Error executing status transition.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleUpdatePayment = async (targetPayment: string) => {
    if (!selectedOrder) return;
    setUpdatingPayment(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}/payment`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: targetPayment }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        await handleViewOrder(selectedOrder.id);
        fetchOrders();
      } else {
        setActionError(data.message || 'Failed to update payment status.');
      }
    } catch (err: any) {
      setActionError(err.message || 'Error executing payment status update.');
    } finally {
      setUpdatingPayment(false);
    }
  };

  if (!isHydrated) {
    return null;
  }

  // Helper colors mapping
  const getOrderStatusStyles = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-200/50';
      case 'CONFIRMED':
        return 'bg-blue-50 text-blue-700 border-blue-200/50';
      case 'PACKED':
        return 'bg-violet-50 text-violet-700 border-violet-200/50';
      case 'OUT_FOR_DELIVERY':
        return 'bg-orange-50 text-orange-700 border-orange-200/50';
      case 'DELIVERED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/50';
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-700 border-rose-200/50';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200/50';
    }
  };

  const getOrderStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Pending';
      case 'CONFIRMED': return 'Confirmed';
      case 'PACKED': return 'Processing';
      case 'OUT_FOR_DELIVERY': return 'Shipped';
      case 'DELIVERED': return 'Delivered';
      case 'CANCELLED': return 'Cancelled';
      default: return status;
    }
  };

  const getPaymentStatusStyles = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-200/50';
      case 'PROCESSING':
        return 'bg-blue-50 text-blue-700 border-blue-200/50';
      case 'PAID':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/50';
      case 'FAILED':
        return 'bg-rose-50 text-rose-700 border-rose-200/50';
      case 'REFUNDED':
        return 'bg-slate-100 text-slate-600 border-slate-250';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(val);
  };

  const formatDate = (isoStr: string) => {
    return new Date(isoStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Overview Head */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold font-display text-slate-800 tracking-tight">Orders Management</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">Monitor transactions, process delivery slots, and log payment updates</p>
        </div>
        <button
          onClick={fetchOrders}
          disabled={loading}
          className="self-start sm:self-center flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-sm transition disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          Refresh List
        </button>
      </div>

      {/* FILTER CONTROLS BAR */}
      <div className="bg-white rounded-3xl border border-slate-200/60 p-5 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          {/* Search box */}
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Order #, customer name or email..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs font-semibold"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none text-xs font-bold text-slate-700 bg-white"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PACKED">Processing</option>
              <option value="OUT_FOR_DELIVERY">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            {/* Payment Filter */}
            <select
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none text-xs font-bold text-slate-700 bg-white"
            >
              <option value="">All Payments</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="PAID">Paid</option>
              <option value="FAILED">Failed</option>
              <option value="REFUNDED">Refunded</option>
            </select>

            {/* Sort Order */}
            <select
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none text-xs font-bold text-slate-700 bg-white"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest_amount">Highest Amount</option>
              <option value="lowest_amount">Lowest Amount</option>
            </select>

            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* ERROR CARD */}
      {error && (
        <div className="p-6 bg-rose-50 border border-rose-100 text-rose-800 rounded-3xl flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold">Failed to load orders list</p>
            <p className="text-[11px] text-rose-600/90 font-medium mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* DATA TABLE CONTAINER */}
      <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Retrieving transactions...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
            <div className="h-12 w-12 bg-slate-50 border border-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <Filter className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-700">No matching orders found</p>
              <p className="text-[10px] text-slate-450 font-semibold max-w-xs mx-auto">
                Try clearing active filters or adjusting the search keywords.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs font-semibold text-slate-600">
              <thead className="bg-slate-50/75 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Items Count</th>
                  <th className="px-6 py-4">Grand Total</th>
                  <th className="px-6 py-4">Payment Status</th>
                  <th className="px-6 py-4">Order Status</th>
                  <th className="px-6 py-4">Created Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition duration-150">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      <span className="font-mono text-[11px] bg-slate-100 text-slate-650 px-2 py-1 rounded">
                        #{order.orderNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-full bg-emerald-105 border border-emerald-200 text-emerald-800 flex items-center justify-center text-[10px] font-bold overflow-hidden shrink-0">
                          {order.user.profileImage ? (
                            <img src={order.user.profileImage} alt="" className="h-full w-full object-cover" />
                          ) : (
                            order.user.fullName.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{order.user.fullName}</p>
                          <p className="text-[10px] text-slate-400 font-semibold">{order.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {formatCurrency(order.grandTotal)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border uppercase tracking-wider ${getPaymentStatusStyles(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border uppercase tracking-wider ${getOrderStatusStyles(order.orderStatus)}`}>
                        {getOrderStatusLabel(order.orderStatus)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-semibold text-[11px]">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleViewOrder(order.id)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition inline-flex items-center gap-1 text-[10px] font-bold"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION PANEL */}
        {orders.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400">
              Showing {orders.length} of {totalCount} orders
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1 || loading}
                className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-bold text-slate-800">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || loading}
                className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DETAIL DRAWER / MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm">
          {/* Overlay dismissal */}
          <div className="absolute inset-0" onClick={() => setSelectedOrder(null)} />
          
          <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-slide-left z-10">
            {/* Header */}
            <div className="h-16 px-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-extrabold bg-slate-250 text-slate-800 px-2.5 py-1 rounded-lg">
                  #{selectedOrder.orderNumber}
                </span>
                <h2 className="text-xs font-extrabold text-slate-550 uppercase tracking-wider">Order Details</h2>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Scrollable details body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {actionError && (
                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-2xl flex items-start gap-2.5 text-xs font-semibold">
                  <AlertTriangle className="h-4.5 w-4.5 shrink-0 text-rose-600" />
                  <span>{actionError}</span>
                </div>
              )}

              {/* TIMELINE PROGRESS COMPONENT */}
              <div className="bg-slate-50/50 rounded-2xl border border-slate-100 p-5 space-y-4">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> Lifecycle Timeline
                </h3>

                <div className="grid grid-cols-5 gap-1.5 relative pt-4">
                  {/* Progress Line */}
                  <div className="absolute left-[10%] right-[10%] top-[24px] h-0.5 bg-slate-200 -z-10" />

                  {/* Step 1: Created */}
                  <div className="text-center space-y-1.5">
                    <div className="h-5 w-5 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto text-[9px] font-bold">
                      ✓
                    </div>
                    <p className="text-[10px] font-bold text-slate-800">Created</p>
                    <p className="text-[8px] text-slate-400 font-semibold">{formatDate(selectedOrder.createdAt).split(',')[0]}</p>
                  </div>

                  {/* Step 2: Confirmed */}
                  {(() => {
                    const isConfirmed = ['CONFIRMED', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(selectedOrder.orderStatus);
                    return (
                      <div className="text-center space-y-1.5">
                        <div className={`h-5 w-5 rounded-full flex items-center justify-center mx-auto text-[9px] font-bold ${
                          isConfirmed ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-450'
                        }`}>
                          {isConfirmed ? '✓' : '2'}
                        </div>
                        <p className={`text-[10px] font-bold ${isConfirmed ? 'text-slate-800' : 'text-slate-400'}`}>Confirmed</p>
                      </div>
                    );
                  })()}

                  {/* Step 3: Processing */}
                  {(() => {
                    const isProcessing = ['PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(selectedOrder.orderStatus);
                    return (
                      <div className="text-center space-y-1.5">
                        <div className={`h-5 w-5 rounded-full flex items-center justify-center mx-auto text-[9px] font-bold ${
                          isProcessing ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-450'
                        }`}>
                          {isProcessing ? '✓' : '3'}
                        </div>
                        <p className={`text-[10px] font-bold ${isProcessing ? 'text-slate-800' : 'text-slate-400'}`}>Processing</p>
                      </div>
                    );
                  })()}

                  {/* Step 4: Shipped */}
                  {(() => {
                    const isShipped = ['OUT_FOR_DELIVERY', 'DELIVERED'].includes(selectedOrder.orderStatus);
                    return (
                      <div className="text-center space-y-1.5">
                        <div className={`h-5 w-5 rounded-full flex items-center justify-center mx-auto text-[9px] font-bold ${
                          isShipped ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-450'
                        }`}>
                          {isShipped ? '✓' : '4'}
                        </div>
                        <p className={`text-[10px] font-bold ${isShipped ? 'text-slate-800' : 'text-slate-400'}`}>Shipped</p>
                      </div>
                    );
                  })()}

                  {/* Step 5: Delivered */}
                  {(() => {
                    const isDelivered = selectedOrder.orderStatus === 'DELIVERED';
                    return (
                      <div className="text-center space-y-1.5">
                        <div className={`h-5 w-5 rounded-full flex items-center justify-center mx-auto text-[9px] font-bold ${
                          isDelivered ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-450'
                        }`}>
                          {isDelivered ? '✓' : '5'}
                        </div>
                        <p className={`text-[10px] font-bold ${isDelivered ? 'text-slate-800' : 'text-slate-400'}`}>Delivered</p>
                      </div>
                    );
                  })()}

                </div>

                {selectedOrder.orderStatus === 'CANCELLED' && (
                  <div className="bg-rose-50 border border-rose-100 text-rose-700 p-4 rounded-xl flex items-start gap-2.5 text-xs font-semibold">
                    <AlertTriangle className="h-4.5 w-4.5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Order Cancelled</p>
                      <p className="text-[10px] text-rose-600/90 font-medium mt-0.5">
                        Status updated to CANCELLED. Any allocated inventory has been restored.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* TWO COLUMN SUMMARY */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Customer Information */}
                <div className="space-y-3 bg-white rounded-2xl border border-slate-100 p-5">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="h-4 w-4 text-slate-400" /> Customer Information
                  </h4>
                  <div className="text-xs space-y-1 font-semibold text-slate-650">
                    <p className="font-extrabold text-slate-900">{selectedOrder.user.fullName}</p>
                    <p>{selectedOrder.user.email}</p>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="space-y-3 bg-white rounded-2xl border border-slate-100 p-5">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-slate-400" /> Delivery Address
                  </h4>
                  <div className="text-xs space-y-0.5 font-semibold text-slate-650">
                    <p className="font-extrabold text-slate-900">{selectedOrder.address.fullName}</p>
                    <p>Phone: {selectedOrder.address.phone}</p>
                    <p>{selectedOrder.address.streetAddress}</p>
                    <p>{selectedOrder.address.city}, {selectedOrder.address.state} - {selectedOrder.address.postalCode}</p>
                  </div>
                </div>

              </div>

              {/* ORDER ITEMS TABLE */}
              <div className="space-y-3 bg-white rounded-2xl border border-slate-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-50 bg-slate-50/50">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Package className="h-4 w-4 text-slate-400" /> Ordered Items
                  </h4>
                </div>
                <div className="divide-y divide-slate-150/70">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="p-4 flex items-center justify-between gap-4 text-xs font-semibold">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 border border-slate-205 rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center shrink-0">
                          {item.productImage ? (
                            <img src={item.productImage} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <Package className="h-4 w-4 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{item.productName}</p>
                          <p className="text-[10px] text-slate-400 font-semibold">{formatCurrency(item.unitPrice)} each</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900">{formatCurrency(item.totalPrice)}</p>
                        <p className="text-[10px] text-slate-400 font-bold">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* BILLING BREAKDOWN */}
              <div className="bg-slate-50/50 rounded-2xl border border-slate-100 p-5 space-y-2.5 text-xs font-semibold text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-800">{formatCurrency(selectedOrder.subtotal)}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Product Discount</span>
                    <span>-{formatCurrency(selectedOrder.discount)}</span>
                  </div>
                )}
                {selectedOrder.couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Coupon Discount ({selectedOrder.couponCode})</span>
                    <span>-{formatCurrency(selectedOrder.couponDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>GST (18%)</span>
                  <span className="font-bold text-slate-800">{formatCurrency(selectedOrder.gst)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="font-bold text-slate-800">{formatCurrency(selectedOrder.deliveryFee)}</span>
                </div>
                <div className="border-t border-slate-200/80 pt-2.5 flex justify-between text-sm font-black text-slate-900">
                  <span>Grand Total</span>
                  <span>{formatCurrency(selectedOrder.grandTotal)}</span>
                </div>
              </div>

              {/* PAYMENT DETAILS */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="h-4 w-4 text-slate-400" /> Payment Details
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-650">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Method</p>
                    <p className="font-bold text-slate-900 mt-0.5">{selectedOrder.paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Status</p>
                    <p className="font-bold text-slate-900 mt-0.5">{selectedOrder.paymentStatus}</p>
                  </div>
                  {selectedOrder.paymentCompletedAt && (
                    <div className="col-span-1 sm:col-span-2">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Settlement Date</p>
                      <p className="font-semibold text-slate-800 mt-0.5">{formatDate(selectedOrder.paymentCompletedAt)}</p>
                    </div>
                  )}
                </div>

                {/* Edit Payment Status Action */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-2">Set Payment Status:</span>
                  {['PENDING', 'PROCESSING', 'PAID', 'FAILED', 'REFUNDED'].map((pStatus) => {
                    const isActive = selectedOrder.paymentStatus === pStatus;
                    return (
                      <button
                        key={pStatus}
                        onClick={() => handleUpdatePayment(pStatus)}
                        disabled={isActive || updatingPayment}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold border transition ${
                          isActive 
                            ? 'bg-slate-900 border-slate-900 text-white' 
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {pStatus}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Quick Actions Sticky Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-55/75 backdrop-blur-sm flex flex-wrap items-center justify-between gap-3 shrink-0">
              
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Change Status:</span>
                
                {/* PENDING -> CONFIRMED */}
                {selectedOrder.orderStatus === 'PENDING' && (
                  <button
                    onClick={() => handleUpdateStatus('CONFIRMED')}
                    disabled={updatingStatus}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-[10px] font-bold shadow-sm transition"
                  >
                    Confirm Order
                  </button>
                )}

                {/* CONFIRMED -> PACKED (Processing) */}
                {selectedOrder.orderStatus === 'CONFIRMED' && (
                  <button
                    onClick={() => handleUpdateStatus('PACKED')}
                    disabled={updatingStatus}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-[10px] font-bold shadow-sm transition"
                  >
                    Process Order
                  </button>
                )}

                {/* PACKED -> OUT_FOR_DELIVERY (Shipped) */}
                {selectedOrder.orderStatus === 'PACKED' && (
                  <button
                    onClick={() => handleUpdateStatus('OUT_FOR_DELIVERY')}
                    disabled={updatingStatus}
                    className="px-4 py-2 bg-orange-550 hover:bg-orange-600 text-white rounded-full text-[10px] font-bold shadow-sm transition"
                  >
                    Ship Order
                  </button>
                )}

                {/* OUT_FOR_DELIVERY -> DELIVERED */}
                {selectedOrder.orderStatus === 'OUT_FOR_DELIVERY' && (
                  <button
                    onClick={() => handleUpdateStatus('DELIVERED')}
                    disabled={updatingStatus}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-[10px] font-bold shadow-sm transition"
                  >
                    Deliver Order
                  </button>
                )}

                {/* Cancel option */}
                {['PENDING', 'CONFIRMED'].includes(selectedOrder.orderStatus) && (
                  <button
                    onClick={() => handleUpdateStatus('CANCELLED')}
                    disabled={updatingStatus}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-full text-[10px] font-bold transition border border-rose-200"
                  >
                    Cancel Order
                  </button>
                )}
                
                {/* Fallback label when finished */}
                {['DELIVERED', 'CANCELLED'].includes(selectedOrder.orderStatus) && (
                  <span className="text-xs font-semibold text-slate-400 italic">No further transitions allowed</span>
                )}

              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-full text-[10px] font-bold shadow-sm hover:bg-slate-50 transition"
              >
                Close
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
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
  Users,
  TrendingUp,
  ShoppingBag,
  RefreshCw,
  ArrowUpRight
} from 'lucide-react';
import { useHydrated } from '@/hooks/useHydrated';

interface Address {
  id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  landmark: string | null;
  city: string;
  state: string;
  postalCode: string;
  addressType: string;
  isDefault: boolean;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  grandTotal: number;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
}

interface CustomerDetails {
  profile: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    profileImage: string | null;
    registrationDate: string;
  };
  stats: {
    totalOrders: number;
    totalSpending: number; // LTV
    averageOrderValue: number;
    lastOrderDate: string | null;
  };
  addresses: Address[];
  recentOrders: RecentOrder[];
}

interface CustomerSummary {
  totalCustomersCount: number;
  totalLifetimeValue: number;
  averageOrdersPerCustomer: number;
}

interface CustomerListItem {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  profileImage: string | null;
  registrationDate: string;
  totalOrders: number;
  totalSpending: number;
  averageOrderValue: number;
  lastOrderDate: string | null;
}

export default function AdminCustomersPage() {
  const isHydrated = useHydrated();
  
  // List States
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [summary, setSummary] = useState<CustomerSummary | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter States
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');

  // Customer Details Drawer State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [details, setDetails] = useState<CustomerDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '8',
        sort: sortOrder,
        ...(search && { search }),
      });

      const res = await fetch(`/api/admin/customers?${params.toString()}`);
      const data = await res.json();

      if (data.success && data.data) {
        setCustomers(data.data.customers);
        setSummary(data.data.summary);
        setTotalCount(data.data.totalCount);
        setTotalPages(data.data.totalPages);
      } else {
        setError(data.message || 'Failed to load customers list.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error occurred while loading customers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isHydrated) {
      fetchCustomers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated, currentPage, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCustomers();
  };

  const loadCustomerDetails = async (id: string) => {
    setSelectedCustomerId(id);
    setDetailsLoading(true);
    setDetails(null);
    setDetailsError(null);

    try {
      const res = await fetch(`/api/admin/customers/${id}`);
      const data = await res.json();
      if (data.success && data.data) {
        setDetails(data.data);
      } else {
        setDetailsError(data.message || 'Failed to load customer profile.');
      }
    } catch (err: any) {
      setDetailsError(err.message || 'Error occurred while loading profile.');
    } finally {
      setDetailsLoading(false);
    }
  };

  if (!isHydrated) {
    return null;
  }

  // Format Helper Utilities
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
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
      case 'PENDING': return 'bg-amber-50 text-amber-700 border-amber-200/50';
      case 'CONFIRMED': return 'bg-blue-50 text-blue-700 border-blue-200/50';
      case 'PACKED': return 'bg-violet-50 text-violet-700 border-violet-200/50';
      case 'OUT_FOR_DELIVERY': return 'bg-orange-50 text-orange-700 border-orange-200/50';
      case 'DELIVERED': return 'bg-emerald-50 text-emerald-700 border-emerald-200/50';
      case 'CANCELLED': return 'bg-rose-50 text-rose-700 border-rose-200/50';
      default: return 'bg-slate-50 text-slate-700 border-slate-200/50';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Head */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold font-display text-slate-800 tracking-tight">Customers Management</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">Browse customer directory details, total spend metrics, and address listings</p>
        </div>
        <button
          onClick={fetchCustomers}
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

      {/* SUMMARY METRICS CARDS */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Total customer base */}
          <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Customer Base</span>
              <h3 className="text-2xl font-black font-display text-slate-800">{summary.totalCustomersCount}</h3>
              <p className="text-[10px] text-slate-450 font-semibold">Registered customer profiles</p>
            </div>
            <div className="h-10 w-10 bg-violet-50 text-violet-650 rounded-full flex items-center justify-center border border-violet-100/50">
              <Users className="h-4.5 w-4.5" />
            </div>
          </div>

          {/* Card 2: Combined LTV */}
          <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Combined LTV</span>
              <h3 className="text-2xl font-black font-display text-slate-800">{formatCurrency(summary.totalLifetimeValue)}</h3>
              <p className="text-[10px] text-slate-450 font-semibold">Total settled revenue from paid orders</p>
            </div>
            <div className="h-10 w-10 bg-emerald-50 text-emerald-650 rounded-full flex items-center justify-center border border-emerald-100/50">
              <TrendingUp className="h-4.5 w-4.5" />
            </div>
          </div>

          {/* Card 3: Average orders per buyer */}
          <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Avg. Frequency</span>
              <h3 className="text-2xl font-black font-display text-slate-800">{summary.averageOrdersPerCustomer.toFixed(1)}</h3>
              <p className="text-[10px] text-slate-450 font-semibold">Average orders submitted per buyer</p>
            </div>
            <div className="h-10 w-10 bg-blue-50 text-blue-650 rounded-full flex items-center justify-center border border-blue-100/50">
              <ShoppingBag className="h-4.5 w-4.5" />
            </div>
          </div>
        </div>
      )}

      {/* FILTER SEARCH BAR */}
      <div className="bg-white rounded-3xl border border-slate-200/60 p-5 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customers by name, email or phone number..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs font-semibold"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none text-xs font-bold text-slate-700 bg-white"
            >
              <option value="newest">Newest Joined</option>
              <option value="oldest">Oldest Joined</option>
              <option value="highest_spending">Highest Spending (LTV)</option>
              <option value="most_orders">Most Orders</option>
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
        <div className="p-6 bg-rose-50 border border-rose-100 text-rose-850 rounded-3xl flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold">Failed to load customer base</p>
            <p className="text-[11px] text-rose-600/90 font-medium mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* CUSTOMERS TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Retrieving profiles...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
            <div className="h-12 w-12 bg-slate-50 border border-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <Users className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-700">No matching customers found</p>
              <p className="text-[10px] text-slate-450 font-semibold max-w-xs mx-auto">
                Modify search keywords to locate customer accounts.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs font-semibold text-slate-600">
              <thead className="bg-slate-50/75 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Total Orders</th>
                  <th className="px-6 py-4">Lifetime Spending</th>
                  <th className="px-6 py-4">Last Order</th>
                  <th className="px-6 py-4">Joined Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition duration-150">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 flex items-center justify-center text-[11px] font-extrabold overflow-hidden shrink-0">
                          {c.profileImage ? (
                            <img src={c.profileImage} alt="" className="h-full w-full object-cover" />
                          ) : (
                            c.fullName.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{c.fullName}</p>
                          <p className="text-[10px] text-slate-400 font-semibold">{c.phone || 'No phone logged'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {c.email}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 text-slate-650 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold">
                        {c.totalOrders} orders
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {formatCurrency(c.totalSpending)}
                    </td>
                    <td className="px-6 py-4 text-slate-450 text-[11px]">
                      {c.lastOrderDate ? formatDate(c.lastOrderDate) : <span className="text-slate-300 italic text-[10px]">No orders yet</span>}
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-[11px]">
                      {formatDate(c.registrationDate)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => loadCustomerDetails(c.id)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition inline-flex items-center gap-1 text-[10px] font-bold"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION PANEL */}
        {customers.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400">
              Showing {customers.length} of {totalCount} customers
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

      {/* PROFILE DETAILS DRAWER */}
      {selectedCustomerId && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setSelectedCustomerId(null)} />
          
          <div className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col animate-slide-left z-10">
            {/* Header */}
            <div className="h-16 px-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
              <h2 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Customer Profile Details</h2>
              <button
                onClick={() => setSelectedCustomerId(null)}
                className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Scrollable content body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {detailsLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 className="h-7 w-7 animate-spin text-emerald-500" />
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Gathering metrics...</p>
                </div>
              ) : detailsError ? (
                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-2xl flex items-start gap-2 text-xs font-semibold">
                  <AlertTriangle className="h-4.5 w-4.5 text-rose-600 shrink-0 mt-0.5" />
                  <span>{detailsError}</span>
                </div>
              ) : details ? (
                <>
                  {/* Profile section card */}
                  <div className="bg-slate-50/50 rounded-2xl border border-slate-100 p-5 flex items-center gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-emerald-100 border border-emerald-200 text-emerald-800 flex items-center justify-center text-xl font-extrabold overflow-hidden shrink-0">
                      {details.profile.profileImage ? (
                        <img src={details.profile.profileImage} alt="" className="h-full w-full object-cover" />
                      ) : (
                        details.profile.fullName.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <h3 className="font-extrabold text-slate-800 text-sm">{details.profile.fullName}</h3>
                      <p className="text-xs font-semibold text-slate-500">{details.profile.email}</p>
                      <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Member since {formatDate(details.profile.registrationDate)}
                      </p>
                    </div>
                  </div>

                  {/* Financial & Statistics Overview */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white border border-slate-100 rounded-2xl p-4 text-center">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Orders</span>
                      <p className="text-lg font-black text-slate-800 mt-1">{details.stats.totalOrders}</p>
                    </div>
                    <div className="bg-white border border-slate-100 rounded-2xl p-4 text-center">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Spending (LTV)</span>
                      <p className="text-lg font-black text-slate-800 mt-1">{formatCurrency(details.stats.totalSpending)}</p>
                    </div>
                    <div className="bg-white border border-slate-100 rounded-2xl p-4 text-center">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Avg Value</span>
                      <p className="text-lg font-black text-slate-800 mt-1">{formatCurrency(details.stats.averageOrderValue)}</p>
                    </div>
                  </div>

                  {/* Order History */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recent Order History</h4>
                    
                    {details.recentOrders.length === 0 ? (
                      <p className="text-xs font-semibold text-slate-400 italic">No orders submitted by this customer yet.</p>
                    ) : (
                      <div className="space-y-2.5">
                        {details.recentOrders.map((order) => (
                          <div key={order.id} className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between gap-3 text-xs font-semibold">
                            <div className="space-y-1">
                              <p className="font-bold text-slate-800">Order #{order.orderNumber}</p>
                              <p className="text-[10px] text-slate-400 font-semibold">{formatDate(order.createdAt)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border tracking-wider ${getOrderStatusStyles(order.orderStatus)}`}>
                                {order.orderStatus}
                              </span>
                              <span className="font-extrabold text-slate-900">{formatCurrency(order.grandTotal)}</span>
                              
                              {/* Direct Link to existing Order details page */}
                              <a
                                href={`/admin/orders?orderId=${order.id}`}
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition inline-flex items-center gap-0.5 text-[9px] font-bold"
                              >
                                View <ArrowUpRight className="h-3 w-3 text-slate-500" />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Delivery Addresses */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Delivery Addresses</h4>
                    
                    {details.addresses.length === 0 ? (
                      <p className="text-xs font-semibold text-slate-400 italic">No address listings found for this customer.</p>
                    ) : (
                      <div className="grid grid-cols-1 gap-2.5">
                        {details.addresses.map((addr) => (
                          <div key={addr.id} className="p-4 border border-slate-100 bg-slate-50/50 rounded-2xl flex gap-3 text-xs font-semibold">
                            <MapPin className="h-4.5 w-4.5 text-slate-400 shrink-0 mt-0.5" />
                            <div className="space-y-0.5 text-slate-650">
                              <p className="font-extrabold text-slate-800 flex items-center gap-1.5">
                                {addr.fullName} 
                                {addr.isDefault && (
                                  <span className="text-[8px] bg-emerald-50 text-emerald-700 px-2 py-0.5 border border-emerald-100 rounded-full">Default</span>
                                )}
                              </p>
                              <p className="text-[10px] text-slate-450">Phone: {addr.phone}</p>
                              <p>{addr.addressLine1} {addr.addressLine2 && `, ${addr.addressLine2}`}</p>
                              <p>{addr.city}, {addr.state} - {addr.postalCode}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </>
              ) : null}
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-slate-100 bg-slate-50 shrink-0 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedCustomerId(null)}
                className="px-5 py-2 bg-slate-205 hover:bg-slate-300 text-slate-700 rounded-full text-xs font-bold transition border border-slate-200"
              >
                Close Profile
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

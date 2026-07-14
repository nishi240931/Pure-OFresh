'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  Package, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { useHydrated } from '@/hooks/useHydrated';

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  pendingOrders: number;
  deliveredOrders: number;
  lowStockProducts: number;
}

export default function AdminDashboardPage() {
  const isHydrated = useHydrated();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/dashboard');
      const data = await res.json();
      if (data.success && data.data) {
        setStats(data.data);
      } else {
        setError(data.message || 'Failed to fetch dashboard metrics.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error occurred while fetching metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isHydrated) {
      fetchStats();
    }
  }, [isHydrated]);

  if (!isHydrated) {
    return null;
  }

  // Format currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold font-display text-slate-800 tracking-tight">Overview</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">Real-time KPI metrics aggregated directly from PostgreSQL</p>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="self-start sm:self-center flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-sm transition disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          Refresh Metrics
        </button>
      </div>

      {/* ERROR CARD */}
      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-700 p-6 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="text-xs font-bold">Failed to load Dashboard stats</p>
              <p className="text-[11px] text-rose-600/90 font-medium mt-0.5">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchStats}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-[11px] font-bold transition shadow-sm"
          >
            Retry Fetch
          </button>
        </div>
      )}

      {/* SKELETON LOADING GRID */}
      {loading && !stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm space-y-4 animate-pulse">
              <div className="flex justify-between items-start">
                <div className="h-4 w-24 bg-slate-100 rounded" />
                <div className="h-9 w-9 bg-slate-100 rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="h-7 w-20 bg-slate-100 rounded" />
                <div className="h-3 w-32 bg-slate-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LIVE KPI GRID */}
      {stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* CARD 1: REVENUE */}
            <div className="bg-white rounded-3xl border border-slate-200/65 p-6 shadow-sm hover:shadow-md transition duration-200 relative overflow-hidden flex flex-col justify-between min-h-[140px]">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Revenue</span>
                <div className="h-9 w-9 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-100">
                  <TrendingUp className="h-4.5 w-4.5" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-black font-display text-slate-800">{formatCurrency(stats.totalRevenue)}</h3>
                <p className="text-[10px] font-bold text-emerald-600 mt-1 flex items-center gap-1">
                  <span>●</span> Paid orders settlement
                </p>
              </div>
            </div>

            {/* CARD 2: ORDERS */}
            <div className="bg-white rounded-3xl border border-slate-200/65 p-6 shadow-sm hover:shadow-md transition duration-200 relative overflow-hidden flex flex-col justify-between min-h-[140px]">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Orders</span>
                <div className="h-9 w-9 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center border border-blue-100">
                  <ShoppingBag className="h-4.5 w-4.5" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-black font-display text-slate-800">{stats.totalOrders}</h3>
                <p className="text-[10px] font-bold text-blue-600 mt-1 flex items-center gap-1">
                  <span>●</span> Registered transactions
                </p>
              </div>
            </div>

            {/* CARD 3: CUSTOMERS */}
            <div className="bg-white rounded-3xl border border-slate-200/65 p-6 shadow-sm hover:shadow-md transition duration-200 relative overflow-hidden flex flex-col justify-between min-h-[140px]">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Customers</span>
                <div className="h-9 w-9 bg-violet-50 text-violet-600 rounded-full flex items-center justify-center border border-violet-100">
                  <Users className="h-4.5 w-4.5" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-black font-display text-slate-800">{stats.totalCustomers}</h3>
                <p className="text-[10px] font-bold text-violet-600 mt-1 flex items-center gap-1">
                  <span>●</span> Registered buyer profiles
                </p>
              </div>
            </div>

            {/* CARD 4: PRODUCTS */}
            <div className="bg-white rounded-3xl border border-slate-200/65 p-6 shadow-sm hover:shadow-md transition duration-200 relative overflow-hidden flex flex-col justify-between min-h-[140px]">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Products</span>
                <div className="h-9 w-9 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center border border-amber-100">
                  <Package className="h-4.5 w-4.5" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-black font-display text-slate-800">{stats.totalProducts}</h3>
                <p className="text-[10px] font-bold text-amber-600 mt-1 flex items-center gap-1">
                  <span>●</span> Unique catalog items
                </p>
              </div>
            </div>

          </div>

          {/* Operational Metrics Subgrid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Status counts sub-card */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/70 p-6 shadow-sm space-y-6">
              <h2 className="text-sm font-extrabold font-display text-slate-800 tracking-tight uppercase border-b border-slate-100 pb-3">
                Order Status Breakdown
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Pending box */}
                <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/60">
                  <div className="h-10 w-10 bg-amber-100/70 text-amber-800 rounded-xl flex items-center justify-center">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Pending Orders</p>
                    <p className="text-lg font-black text-slate-800 mt-0.5">{stats.pendingOrders}</p>
                  </div>
                </div>

                {/* Delivered box */}
                <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/60">
                  <div className="h-10 w-10 bg-emerald-100/70 text-emerald-800 rounded-xl flex items-center justify-center">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Delivered Orders</p>
                    <p className="text-lg font-black text-slate-800 mt-0.5">{stats.deliveredOrders}</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Inventory Alerts sub-card */}
            <div className="bg-white rounded-3xl border border-slate-200/70 p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-extrabold font-display text-slate-800 tracking-tight uppercase border-b border-slate-100 pb-3">
                Inventory Alerts
              </h2>
              <div className="flex items-center gap-4 p-4 rounded-2xl border border-rose-100 bg-rose-50/40 text-rose-800">
                <div className="h-10 w-10 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wide">Low Stock Products</p>
                  <p className="text-lg font-black text-rose-900 mt-0.5">{stats.lowStockProducts}</p>
                </div>
              </div>
              <p className="text-[10px] text-slate-450 font-semibold leading-relaxed px-1">
                Products count with current stock availability below 20 items. Restocking is recommended.
              </p>
            </div>

          </div>
        </>
      )}

      {/* EMPTY STATE */}
      {!loading && !stats && !error && (
        <div className="bg-white rounded-3xl border border-slate-200/60 p-8 text-center text-slate-400 max-w-sm mx-auto shadow-sm">
          <p className="text-xs font-bold text-slate-600">No dashboard records found.</p>
          <p className="text-[11px] text-slate-400 mt-1">Metrics could not be resolved from database.</p>
        </div>
      )}

    </div>
  );
}

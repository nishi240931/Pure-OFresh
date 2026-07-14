import React from 'react';
import { TrendingUp } from 'lucide-react';

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold font-display text-slate-800 tracking-tight">Analytics Dashboard</h1>
        <p className="text-xs text-slate-500 font-semibold mt-0.5">Visualize your revenue trends and performance indexes</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/60 p-12 text-center max-w-lg mx-auto shadow-sm space-y-4">
        <div className="h-12 w-12 bg-slate-50 border border-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <TrendingUp className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-bold text-slate-700">Analytics Foundation</p>
          <p className="text-[10px] text-slate-450 font-semibold leading-relaxed max-w-xs mx-auto">
            This module will be fully integrated with sales, category charts, and traffic metrics in subsequent Sprint 8F development.
          </p>
        </div>
      </div>
    </div>
  );
}

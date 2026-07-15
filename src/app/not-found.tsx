'use client';

import React from 'react';
import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';
import { useHydrated } from '@/hooks/useHydrated';

export default function NotFound() {
  const isHydrated = useHydrated();

  if (!isHydrated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white border border-slate-200/60 rounded-3xl p-10 shadow-sm space-y-6">
        <div className="space-y-2">
          {/* Custom Aesthetic Leaf/Fresh Icon */}
          <div className="mx-auto h-16 w-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-100 shadow-sm animate-bounce">
            <span className="text-2xl font-black font-display">404</span>
          </div>
          <h1 className="text-xl font-extrabold font-display text-slate-800 tracking-tight">
            Page Not Found
          </h1>
          <p className="text-xs text-slate-500 font-semibold leading-relaxed max-w-xs mx-auto">
            Sorry, the page you are looking for does not exist or has been moved. Let's get you back to fresh essentials.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition border border-slate-200"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Go Back
          </button>
          
          <Link
            href="/"
            className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-emerald-650 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-sm"
          >
            <Home className="h-3.5 w-3.5" />
            Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}

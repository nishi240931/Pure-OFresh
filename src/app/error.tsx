'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundaryPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log the error for diagnostics
    console.error('Captured by global error boundary:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white border border-slate-200/60 rounded-3xl p-10 shadow-sm space-y-6">
        <div className="space-y-2">
          <div className="mx-auto h-16 w-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center border border-rose-100 shadow-sm">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-extrabold font-display text-slate-800 tracking-tight">
            Unexpected System Error
          </h1>
          <p className="text-xs text-slate-500 font-semibold leading-relaxed max-w-xs mx-auto">
            A temporary system error occurred. We have logged this diagnostic event and are working to resolve it.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition shadow-sm"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Try Again
          </button>
          
          <Link
            href="/"
            className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-slate-100 hover:bg-slate-205 text-slate-700 text-xs font-bold rounded-xl transition border border-slate-200"
          >
            <Home className="h-3.5 w-3.5" />
            Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}

import Link from 'next/link';
import { ShieldAlert, Home } from 'lucide-react';

export default function AccessDeniedPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xl text-center space-y-6">
        
        <div className="h-16 w-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto text-3xl shadow-sm border border-rose-200 animate-pulse">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h1 className="font-display text-2xl font-extrabold text-slate-800">Access Denied</h1>
          <p className="text-xs text-slate-500 font-semibold max-w-xs mx-auto leading-relaxed">
            You do not have administrative privileges to access this area.
          </p>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-center">
          <Link
            href="/"
            className="flex items-center gap-2 py-3 px-6 bg-[#FF6B00] hover:bg-accent text-white rounded-full text-xs font-bold shadow-md transition"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
        </div>

      </div>
    </div>
  );
}

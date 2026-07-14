'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function OrdersRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/profile?tab=orders');
  }, [router]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-32 text-center text-slate-405 flex flex-col items-center justify-center gap-4">
      <Loader2 className="h-8 w-8 text-primary animate-spin" />
      <span className="text-xs font-semibold text-slate-500">Redirecting to your orders tracker...</span>
    </div>
  );
}

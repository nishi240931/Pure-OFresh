'use client';

import React, { useState } from 'react';
import { mockCoupons } from '@/lib/mockData';
import { BadgePercent, Copy, Check, Sparkles, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export const OffersPage = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 min-h-[85vh] font-sans text-slate-800">
      
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-primary font-bold text-xs uppercase tracking-widest block mb-2">Discount Central</span>
        <h1 className="font-display text-4xl font-extrabold text-slate-800 flex items-center justify-center gap-2">
          <BadgePercent className="h-9 w-9 text-primary animate-pulse" />
          Active Coupons & Deals
        </h1>
        <p className="text-sm text-slate-500 font-semibold mt-3">
          Claim hand-picked deals and coupon discounts to save on your daily organic grocery baskets.
        </p>
      </div>

      {/* Grid of Coupons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {mockCoupons.map((coupon) => (
          <div
            key={coupon.code}
            className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-xl transition duration-300 relative group"
          >
            {/* Header banner */}
            <div className="p-4 bg-primary text-white flex justify-between items-center shrink-0">
              <span className="font-extrabold tracking-wider text-xs">
                {coupon.discountType === 'PERCENTAGE' ? `${coupon.discount}% OFF` : `₹${coupon.discount} FLAT OFF`}
              </span>
              <Sparkles className="h-4 w-4 opacity-75" />
            </div>

            {/* Content */}
            <div className="p-5 flex-grow flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="font-display text-lg font-bold text-slate-800">{coupon.code}</h3>
                <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                  {coupon.description}
                </p>
                <p className="text-[10px] text-slate-400 font-bold">
                  Minimum purchase requirement: ₹{coupon.minPurchase}
                </p>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-150 flex items-center justify-between">
                {/* Copy coupon button */}
                <button
                  onClick={() => handleCopy(coupon.code)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition ${
                    copiedCode === coupon.code
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-50 border border-slate-200 hover:border-primary text-slate-650 hover:text-primary'
                  }`}
                >
                  {copiedCode === coupon.code ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy Code
                    </>
                  )}
                </button>

                <Link
                  href="/products"
                  className="text-primary hover:text-primary-dark text-xs font-bold flex items-center gap-0.5"
                >
                  Apply Code
                  <ShoppingBag className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default OffersPage;

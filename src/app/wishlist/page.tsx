'use client';

import React from 'react';
import { useStore } from '@/store/useStore';
import { useHydrated } from '@/hooks/useHydrated';
import { Heart, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const WishlistPage = () => {
  const isHydrated = useHydrated();

  // Zustand State
  const wishlist = useStore((state) => state.wishlist);
  const adminProducts = useStore((state) => state.adminProducts);
  const toggleWishlist = useStore((state) => state.toggleWishlist);
  const addToCart = useStore((state) => state.addToCart);

  // Filter wishlist items
  const wishlistProducts = adminProducts.filter((p) => wishlist.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 min-h-[85vh] font-sans text-slate-800">
      
      <h1 className="font-display text-3xl font-extrabold text-slate-800 mb-8 flex items-center gap-2">
        <Heart className="h-7 w-7 text-rose-500 fill-rose-500" />
        My Wishlist
      </h1>

      {isHydrated && wishlistProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlistProducts.map((p) => {
            const priceDisc = p.price * (1 - p.discount / 100);
            return (
              <div
                key={p.id}
                className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group relative p-3 h-full"
              >
                {/* Remove button */}
                <button
                  onClick={() => toggleWishlist(p.id)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-rose-50 text-rose-500 shadow-sm transition transform active:scale-95 z-10"
                  aria-label="Remove from wishlist"
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </button>

                <div className="space-y-3 flex-grow flex flex-col">
                  {/* Image */}
                  <div className="h-44 bg-white rounded-xl overflow-hidden border border-slate-100/50 flex items-center justify-center p-3 shrink-0">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="h-full w-full object-contain transform group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80'; }}
                      loading="lazy"
                    />
                  </div>

                  <div className="flex-grow flex flex-col justify-between mt-2">
                    <div>
                      <Link
                        href={`/products/${p.id}`}
                        className="font-bold text-slate-800 text-sm hover:text-primary transition leading-snug block line-clamp-2 h-10"
                      >
                        {p.name}
                      </Link>
                      <span className="text-[10px] text-slate-400 font-bold block mt-0.5">{p.unit}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 mt-auto border-t border-slate-150 shrink-0">
                  <div className="flex flex-col">
                    {p.discount > 0 && (
                      <span className="text-[9px] text-slate-400 line-through leading-none mb-0.5">₹{Math.round(p.price)}</span>
                    )}
                    <span className="text-sm font-extrabold text-slate-800">₹{Math.round(priceDisc)}</span>
                  </div>

                  <button
                    onClick={() => addToCart(p, 1)}
                    className="flex items-center gap-1 bg-primary hover:bg-primary-dark text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow transition active:scale-95 shrink-0"
                  >
                    <ShoppingBag className="h-3.5 w-3.5" />
                    Add
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-16 border border-slate-100 shadow-sm flex flex-col items-center gap-5 text-slate-400 max-w-xl mx-auto">
          <Heart className="h-20 w-20 text-slate-200" />
          <div className="text-center">
            <h2 className="font-bold text-slate-800 text-base">Your Wishlist is Empty</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Save your favorite items here so you can add them to your cart easily later.
            </p>
          </div>
          <Link
            href="/products"
            className="px-8 py-3 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-full transition shadow-md flex items-center gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" /> Start Browsing
          </Link>
        </div>
      )}

    </div>
  );
};

export default WishlistPage;

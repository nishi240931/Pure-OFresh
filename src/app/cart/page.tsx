'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { useHydrated } from '@/hooks/useHydrated';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowLeft,
  ArrowRight,
  BadgePercent,
  Check,
  X
} from 'lucide-react';
import { mockCoupons } from '@/lib/mockData';

export const CartPage = () => {
  const router = useRouter();
  const isHydrated = useHydrated();

  // Zustand State
  const cart = useStore((state) => state.cart);
  const coupon = useStore((state) => state.coupon);
  const couponError = useStore((state) => state.couponError);
  const cartSummary = useStore((state) => state.cartSummary);
  const cartLoading = useStore((state) => state.cartLoading);
  
  const updateQuantity = useStore((state) => state.updateQuantity);
  const removeFromCart = useStore((state) => state.removeFromCart);
  const clearCart = useStore((state) => state.clearCart);
  const applyCoupon = useStore((state) => state.applyCoupon);
  const removeCoupon = useStore((state) => state.removeCoupon);

  const getCartSubtotal = useStore((state) => state.getCartSubtotal);
  const getCartDiscount = useStore((state) => state.getCartDiscount);
  const getCartTax = useStore((state) => state.getCartTax);
  const getCartTotal = useStore((state) => state.getCartTotal);

  const [couponCodeInput, setCouponCodeInput] = useState('');

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCodeInput.trim()) {
      applyCoupon(couponCodeInput.trim());
    }
  };

  const handleCopyCode = (code: string) => {
    setCouponCodeInput(code);
    applyCoupon(code);
  };

  const subtotal = isHydrated ? (cartSummary ? cartSummary.subtotal : getCartSubtotal()) : 0;
  const discount = isHydrated ? getCartDiscount() : 0;
  const tax = isHydrated ? (cartSummary ? cartSummary.gst : getCartTax()) : 0;
  const deliveryFee = isHydrated ? (cartSummary ? cartSummary.deliveryFee : (subtotal > 15 ? 0 : subtotal === 0 ? 0 : 1.99)) : 0;
  const total = isHydrated ? (cartSummary ? cartSummary.grandTotal : getCartTotal()) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 min-h-[85vh] font-sans text-slate-800">
      
      {/* Title */}
      <h1 className="font-display text-3xl font-extrabold text-slate-800 mb-8 flex items-center gap-2">
        <ShoppingBag className="h-7 w-7 text-primary" />
        Shopping Cart
      </h1>

      {isHydrated && cart.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: CART ITEMS LIST */}
          <div className="lg:col-span-2 space-y-4">
            
            <div className={`bg-white rounded-3xl border border-slate-100 shadow-sm p-4 sm:p-6 divide-y divide-slate-100 ${cartLoading ? 'opacity-65 pointer-events-none' : ''} transition-opacity duration-200`}>
              {cart.map((item) => {
                const discountPrice = item.product.discountPrice !== null && item.product.discountPrice !== undefined
                  ? item.product.discountPrice
                  : item.product.price;
                return (
                  <div key={item.product.id} className="py-5 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center gap-4 relative group">
                    {/* Image */}
                    <div className="h-20 w-20 rounded-2xl overflow-hidden bg-white border border-slate-100 flex items-center justify-center p-2 relative shrink-0">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="h-full w-full object-contain"
                        onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80'; }}
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-grow min-w-0">
                      <Link href={`/products/${item.product.id}`} className="font-bold text-slate-800 text-sm hover:text-primary transition leading-snug block truncate">
                        {item.product.name}
                      </Link>
                      <p className="text-[11px] text-slate-450 font-bold mt-0.5">{item.product.unit}</p>
                      
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-sm font-extrabold text-slate-800">₹{Math.round(discountPrice)}</span>
                        {item.product.discount > 0 && (
                          <span className="text-xs text-slate-400 line-through">₹{Math.round(item.product.price)}</span>
                        )}
                      </div>
                    </div>

                    {/* Quantity Controls & Delete */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto mt-3 sm:mt-0 pt-3 sm:pt-0 border-t border-dashed border-slate-100 sm:border-0">
                      
                      {/* Qty count */}
                      <div className="flex items-center gap-2 border border-slate-200 rounded-full p-1 shadow-sm bg-white">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="p-1 rounded-full hover:bg-slate-100 transition text-slate-650"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="p-1 rounded-full hover:bg-slate-100 transition text-slate-655"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Total for item */}
                      <span className="text-sm font-extrabold text-slate-850 w-16 text-right">
                        ₹{Math.round(discountPrice * item.quantity)}
                      </span>

                      {/* Trash icon */}
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-full transition"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>

                    </div>
                  </div>
                );
              })}
            </div>

            {/* Clear Cart & Return to Shop Actions */}
            <div className="flex justify-between items-center px-4">
              <Link href="/products" className="inline-flex items-center gap-1.5 text-primary hover:text-primary-dark text-xs font-bold transition">
                <ArrowLeft className="h-4.5 w-4.5" /> Continue Shopping
              </Link>
              <button
                onClick={clearCart}
                className="text-xs text-rose-550 hover:text-rose-700 font-bold hover:underline"
              >
                Clear All Cart Items
              </button>
            </div>

          </div>

          {/* RIGHT: ORDER SUMMARY */}
          <div className="space-y-6">
            
            {/* Promo / Coupon Block */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <BadgePercent className="h-4.5 w-4.5 text-primary" />
                Apply Coupon Code
              </h3>

              {coupon ? (
                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <div>
                    <span className="text-xs font-extrabold text-emerald-800">{coupon.code} Applied</span>
                    <p className="text-[10px] text-emerald-600 font-medium">{coupon.description}</p>
                  </div>
                  <button 
                    onClick={removeCoupon}
                    className="p-1 rounded-full hover:bg-emerald-100 transition text-emerald-700"
                    aria-label="Remove coupon"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="ENTER COUPON CODE"
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                    className="flex-grow rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold tracking-wider outline-none focus:border-primary text-slate-800 bg-slate-50 uppercase"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold shadow-md transition"
                  >
                    Apply
                  </button>
                </form>
              )}

              {couponError && (
                <p className="text-[10px] text-rose-500 font-bold">{couponError}</p>
              )}

              {/* Quick Coupon suggestions */}
              {!coupon && (
                <div className="space-y-2 pt-2 border-t border-slate-150">
                  <p className="text-[9px] text-slate-400 font-extrabold uppercase">Available Coupons</p>
                  <div className="flex flex-wrap gap-2">
                    {mockCoupons.map((c) => (
                      <button
                        key={c.code}
                        onClick={() => handleCopyCode(c.code)}
                        className="text-[10px] font-extrabold border border-dashed border-primary/45 hover:border-primary px-2.5 py-1 rounded-lg text-primary bg-primary/5 hover:bg-primary/10 transition"
                      >
                        {c.code}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
              <h3 className="font-bold text-slate-800 text-sm pb-3 border-b border-slate-150">Order Summary</h3>
              
              <div className="space-y-2.5 text-xs text-slate-500 font-semibold">
                <div className="flex justify-between">
                  <span>Bag Subtotal</span>
                  <span className="text-slate-800">₹{Math.round(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon Discount</span>
                    <span>-₹{Math.round(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Tax (5%)</span>
                  <span className="text-slate-800">₹{Math.round(tax)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="text-slate-800">
                    {deliveryFee === 0 ? (
                      <span className="text-green-600 font-bold">FREE</span>
                    ) : (
                      `₹${Math.round(deliveryFee)}`
                    )}
                  </span>
                </div>

                {deliveryFee > 0 && (
                  <p className="text-[9px] text-emerald-600 font-extrabold block text-center pt-2 bg-emerald-50/50 p-2 rounded-xl border border-dashed border-emerald-100">
                    Add ₹{Math.round(499 - subtotal)} more to unlock FREE delivery!
                  </p>
                )}
              </div>

              <div className="flex justify-between items-center text-base border-t border-slate-150 pt-4 font-bold">
                <span className="text-slate-805">Grand Total</span>
                <span className="text-lg font-extrabold text-primary">₹{Math.round(total)}</span>
              </div>

              <button
                onClick={() => router.push('/checkout')}
                className="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-full text-xs font-bold text-center shadow-lg transition flex items-center justify-center gap-1.5"
              >
                Proceed to Checkout
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

          </div>

        </div>
      ) : (
        <div className="bg-white rounded-3xl p-16 border border-slate-100 shadow-sm flex flex-col items-center gap-5 text-slate-400 max-w-xl mx-auto">
          <ShoppingBag className="h-20 w-20 text-slate-200 animate-pulse" />
          <div className="text-center">
            <h2 className="font-bold text-slate-800 text-base">Your Cart is Empty</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Explore our organic produce and daily essentials to start adding items to your cart.
            </p>
          </div>
          <Link
            href="/products"
            className="px-8 py-3 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-full transition shadow-md"
          >
            Start Shopping
          </Link>
        </div>
      )}

    </div>
  );
};

export default CartPage;

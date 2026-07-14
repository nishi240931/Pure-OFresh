'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { useHydrated } from '@/hooks/useHydrated';
import { 
  ShoppingBag, 
  Heart, 
  Star, 
  ArrowLeft, 
  Plus, 
  Minus,
  Check,
  TrendingUp,
  Info,
  Send
} from 'lucide-react';
import { mockCategories, mockReviews } from '@/lib/mockData';
import { motion } from 'framer-motion';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailsPage({ params }: PageProps) {
  const router = useRouter();
  const isHydrated = useHydrated();

  // Resolve params using React.use() - Next.js 15 standard
  const { id } = use(params);

  // Zustand State
  const adminProducts = useStore((state) => state.adminProducts);
  const addToCart = useStore((state) => state.addToCart);
  const toggleWishlist = useStore((state) => state.toggleWishlist);
  const inWishlist = useStore((state) => state.inWishlist);
  const addNotification = useStore((state) => state.addNotification);

  // Find product
  const product = adminProducts.find((p) => p.id === id);

  // States
  const [activeImage, setActiveImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [zoomStyle, setZoomStyle] = useState({ display: 'none', backgroundPosition: '0% 0%' });
  
  // Reviews state (local simulation of adding a review)
  const [localReviews, setLocalReviews] = useState<any[]>([]);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');

  useEffect(() => {
    if (product) {
      setActiveImage(product.image);
      // Load reviews for this product
      const productReviews = mockReviews.filter(r => r.productId === product.id);
      setLocalReviews(productReviews);
    }
  }, [product]);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center space-y-4">
        <h2 className="font-display text-2xl font-bold text-slate-800">Product not found</h2>
        <p className="text-slate-500 text-xs">The product ID does not exist or has been removed.</p>
        <Link href="/products" className="inline-flex items-center gap-1.5 text-primary text-xs font-bold hover:underline">
          <ArrowLeft className="h-4 w-4" /> Return to shop
        </Link>
      </div>
    );
  }

  // Related products (same category, excluding current product)
  const relatedProducts = adminProducts
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 4);

  const discountPrice = product.price * (1 - product.discount / 100);
  const isWish = isHydrated && inWishlist(product.id);

  // Hover Zoom Effect Logic
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      display: 'block',
      backgroundPosition: `${x}% ${y}%`
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none', backgroundPosition: '0% 0%' });
  };

  // Submit Review Simulation
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewComment.trim()) return;

    const newReview = {
      id: 'rev-' + Math.random().toString(36).substr(2, 9),
      userId: 'user-current',
      userName: 'Nishitha Reddy',
      productId: product.id,
      rating: newReviewRating,
      comment: newReviewComment.trim(),
      createdAt: new Date().toISOString().split('T')[0]
    };

    setLocalReviews([newReview, ...localReviews]);
    setNewReviewComment('');
    addNotification('Review Submitted ⭐', `Thank you for sharing your review on ${product.name}!`);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    router.push('/checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 font-sans text-slate-800">
      
      {/* Back button */}
      <Link href="/products" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-700 text-xs font-bold mb-6 transition">
        <ArrowLeft className="h-4.5 w-4.5" /> Back to Store Catalog
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* LEFT COLUMN: IMAGES & GALLERY */}
        <div className="space-y-4">
          
          {/* Main Zoomable Image Frame */}
          <div 
            className="h-[350px] sm:h-[450px] rounded-3xl bg-white relative overflow-hidden border border-slate-100 cursor-zoom-in flex items-center justify-center p-8"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <img
              src={activeImage}
              alt={product.name}
              className="h-full w-full object-contain"
              onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80'; }}
            />

            {/* Hover Zoom Overlay Panel */}
            <div
              className="absolute inset-0 z-10 pointer-events-none bg-no-repeat transition-opacity duration-150"
              style={{
                display: zoomStyle.display,
                backgroundImage: `url('${activeImage}')`,
                backgroundSize: '200%',
                backgroundPosition: zoomStyle.backgroundPosition,
                backgroundColor: '#ffffff'
              }}
            />

            {/* Discount Badge */}
            {product.discount > 0 && (
              <span className="absolute top-4 left-4 bg-accent text-white text-xs font-extrabold px-3.5 py-1.5 rounded-full shadow z-20">
                {product.discount}% OFF
              </span>
            )}
          </div>

          {/* Thumbnail Strip */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`h-16 w-16 rounded-xl overflow-hidden bg-white border-2 transition flex items-center justify-center p-2 ${
                    activeImage === img ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img 
                    src={img} 
                    alt="thumbnail" 
                    className="h-full w-full object-contain" 
                    onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80'; }}
                  />
                </button>
              ))}
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: DETAILS */}
        <div className="space-y-6">
          <div>
            <span className="text-primary font-bold text-xs uppercase tracking-widest block mb-1">Pure Organic</span>
            <h1 className="font-display text-3xl font-extrabold text-slate-850 leading-tight">{product.name}</h1>
            
            {/* Rating and category */}
            <div className="flex items-center gap-4 mt-3 text-xs font-semibold">
              <div className="flex items-center gap-0.5 text-amber-500 bg-amber-50 px-2 py-1 rounded-md border border-amber-100">
                <Star className="h-4 w-4 fill-current" />
                <span>{product.rating}</span>
              </div>
              <span className="text-slate-400">|</span>
              <span className="text-slate-550">{localReviews.length} customer reviews</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-2xl font-extrabold text-slate-800">₹{Math.round(discountPrice)}</span>
            {product.discount > 0 && (
              <>
                <span className="text-sm text-slate-450 line-through">₹{Math.round(product.price)}</span>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-md">
                  Save ₹{Math.round(product.price - discountPrice)}
                </span>
              </>
            )}
            <span className="text-[10px] text-slate-400 font-bold ml-auto">{product.unit} package size</span>
          </div>

          {/* Dynamic Status Grid (Badges, Stock, Delivery) */}
          <div className="grid grid-cols-3 gap-3">
            {/* Badge 1: Organic / Farm Fresh */}
            <div className="bg-emerald-50/60 rounded-xl p-3 border border-emerald-100/50 flex flex-col justify-center items-center text-center">
              <span className="text-[18px] mb-1">🌿</span>
              <span className="text-[10px] text-emerald-800 font-extrabold uppercase tracking-wide">
                {product.categoryId === 'cat-2' || product.categoryId === 'cat-1' ? 'Farm Fresh' : '100% Organic'}
              </span>
            </div>

            {/* Badge 2: Stock Status */}
            <div className={`rounded-xl p-3 border flex flex-col justify-center items-center text-center ${
              product.stock > 0 ? 'bg-slate-50 border-slate-200/60' : 'bg-rose-50 border-rose-100/60'
            }`}>
              <span className="text-[18px] mb-1">{product.stock > 0 ? '📦' : '❌'}</span>
              <span className={`text-[10px] font-extrabold uppercase tracking-wide ${
                product.stock > 0 ? 'text-slate-700' : 'text-rose-600'
              }`}>
                {product.stock > 0 ? `In Stock (${product.stock} units)` : 'Out of Stock'}
              </span>
            </div>

            {/* Badge 3: Delivery Estimate */}
            <div className="bg-amber-50/50 rounded-xl p-3 border border-amber-100/50 flex flex-col justify-center items-center text-center">
              <span className="text-[18px] mb-1">⚡</span>
              <span className="text-[10px] text-amber-800 font-extrabold uppercase tracking-wide">
                20-30 mins
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Product Info</h3>
            <p className="text-slate-500 text-xs leading-relaxed font-semibold">
              {product.description}
            </p>
          </div>

          {/* Nutrition Table */}
          {product.nutrition && (
            <div className="bg-emerald-50/40 rounded-2xl p-4 border border-emerald-100/50">
              <h3 className="font-bold text-emerald-800 text-xs flex items-center gap-1.5 mb-2.5">
                <Info className="h-4 w-4" />
                Nutritional Profile (per 100g)
              </h3>
              <div className="grid grid-cols-2 gap-3 text-[10px] text-slate-655 font-bold">
                {product.nutrition.split(', ').map((nut, idx) => {
                  const [key, val] = nut.split(': ');
                  return (
                    <div key={idx} className="flex justify-between py-1 border-b border-emerald-100/30">
                      <span className="text-slate-450">{key}</span>
                      <span className="text-slate-800 font-extrabold">{val}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity and Action Buttons */}
          <div className="pt-4 border-t border-slate-150 space-y-4">
            
            <div className="flex items-center gap-6">
              <span className="text-xs font-bold text-slate-500">Choose Quantity:</span>
              
              {/* Quantity selectors */}
              <div className="flex items-center gap-3 border border-slate-200 rounded-full p-1 bg-white shadow-sm">
                <button
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  className="p-1 rounded-full hover:bg-slate-100 transition text-slate-600"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="text-sm font-extrabold w-6 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(prev => prev + 1)}
                  className="p-1 rounded-full hover:bg-slate-100 transition text-slate-600"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Wishlist button */}
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-3 rounded-full border transition transform active:scale-95 shadow-sm ${
                  isWish 
                    ? 'bg-rose-50 border-rose-100 text-rose-500' 
                    : 'bg-slate-50 border-slate-200 text-slate-450 hover:bg-slate-100'
                }`}
                aria-label="Add to wishlist"
              >
                <Heart className={`h-5 w-5 ${isWish ? 'fill-current' : ''}`} />
              </button>
            </div>

            <div className="flex gap-4 pt-2">
              <button
                onClick={() => addToCart(product, quantity)}
                className="flex-1 py-3 bg-white border border-primary hover:bg-primary/5 text-primary rounded-full text-xs font-bold shadow transition flex items-center justify-center gap-2"
              >
                <ShoppingBag className="h-4.5 w-4.5" />
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 py-3 bg-primary hover:bg-primary-dark text-white rounded-full text-xs font-bold shadow-lg transition"
              >
                Buy Now
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* REVIEWS SECTION */}
      <section className="mt-16 pt-12 border-t border-slate-150">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Submit Review Form */}
          <div className="lg:col-span-1 space-y-6">
            <div>
              <h3 className="font-display text-lg font-bold text-slate-800">Share Your Experience</h3>
              <p className="text-xs text-slate-450 font-semibold mt-1">Have you ordered this item? Let other grocery shoppers know what you think!</p>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              {/* Rating selection */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Your Rating</label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setNewReviewRating(star)}
                      className={`p-1 transition-all ${
                        newReviewRating >= star ? 'text-amber-500' : 'text-slate-200'
                      }`}
                    >
                      <Star className="h-6 w-6 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Review input */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Your Comment</label>
                <textarea
                  rows={4}
                  placeholder="Review comments on product quality, packaging, freshness..."
                  value={newReviewComment}
                  onChange={(e) => setNewReviewComment(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 text-xs p-3.5 focus:outline-none focus:border-primary text-slate-850"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white rounded-full text-xs font-bold shadow flex items-center justify-center gap-1.5"
              >
                <Send className="h-3.5 w-3.5" />
                Submit Review
              </button>
            </form>
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="font-display text-lg font-bold text-slate-800">Customer Feedback</h3>
            
            <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto pr-2">
              {localReviews.length > 0 ? (
                localReviews.map((rev) => (
                  <div key={rev.id} className="py-4 first:pt-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-800 text-xs">{rev.userName}</h4>
                      <span className="text-[10px] text-slate-400 font-bold">{rev.createdAt}</span>
                    </div>
                    
                    <div className="flex gap-0.5 text-amber-500 mt-1">
                      {[...Array(5)].map((_, idx) => (
                        <Star 
                          key={idx} 
                          className={`h-3 w-3 ${idx < rev.rating ? 'fill-current' : 'text-slate-100'}`} 
                        />
                      ))}
                    </div>

                    <p className="text-slate-550 text-xs mt-2.5 leading-relaxed font-semibold">
                      {rev.comment}
                    </p>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs font-medium">
                  No reviews submitted yet for this product. Be the first to leave one!
                </div>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* RELATED PRODUCTS */}
      {relatedProducts.length > 0 && (
        <section className="mt-20 pt-12 border-t border-slate-150">
          <h3 className="font-display text-xl font-extrabold text-slate-850 mb-8">Related Items You May Like</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => {
              const rPrice = p.price * (1 - p.discount / 100);
              const isWishRel = isHydrated && inWishlist(p.id);

              return (
                <div key={p.id} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between group relative">
                  <div className="h-40 relative bg-slate-50 overflow-hidden shrink-0">
                    <img src={p.image} alt={p.name} className="h-full w-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                    {p.discount > 0 && (
                      <span className="absolute top-2.5 left-2.5 bg-accent text-white text-[8px] font-extrabold px-2 py-0.5 rounded-full">
                        {p.discount}% OFF
                      </span>
                    )}
                    <button
                      onClick={() => toggleWishlist(p.id)}
                      className={`absolute top-2.5 right-2.5 p-1.5 rounded-full shadow-md transition transform active:scale-95 ${
                        isWishRel ? 'bg-rose-50 text-rose-500' : 'bg-white/80 hover:bg-white text-slate-500'
                      }`}
                      aria-label="Add to wishlist"
                    >
                      <Heart className={`h-3.5 w-3.5 ${isWishRel ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  <div className="p-4 flex-grow flex flex-col justify-between">
                    <div>
                      <Link href={`/products/${p.id}`} className="block font-bold text-slate-805 text-xs hover:text-primary transition truncate leading-none mb-1">
                        {p.name}
                      </Link>
                      <span className="text-[9px] text-slate-400 font-bold block">{p.unit}</span>
                    </div>

                    <div className="flex items-center justify-between pt-2 mt-3 border-t border-slate-100">
                      <span className="text-xs font-extrabold text-slate-800">₹{Math.round(rPrice)}</span>
                      <button
                        onClick={() => addToCart(p, 1)}
                        className="p-1.5 bg-primary hover:bg-primary-dark text-white rounded-full transition shadow-sm"
                        aria-label="Add to cart"
                      >
                        <ShoppingBag className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

    </div>
  );
}

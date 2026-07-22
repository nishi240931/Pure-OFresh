'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { useHydrated } from '@/hooks/useHydrated';
import { mockCategories, mockReviews, mockProducts } from '@/lib/mockData';
import { 
  Search, 
  ArrowRight, 
  ShoppingBag, 
  Heart, 
  Star, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  BadgePercent, 
  DollarSign, 
  Smartphone, 
  ThumbsUp,
  TrendingUp,
  MapPin,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

// Mock Categories for Homepage
const homepageCategories = [
  { name: 'Fruits', count: '18 Products', slug: 'fruits', bg: 'bg-emerald-50 text-emerald-800 border-emerald-100', icon: '🍎', image: 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=500&auto=format&fit=crop&q=80' },
  { name: 'Vegetables', count: '24 Products', slug: 'vegetables', bg: 'bg-green-50 text-green-800 border-green-100', icon: '🥦', image: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=500&auto=format&fit=crop&q=80' },
  { name: 'Dairy & Eggs', count: '12 Products', slug: 'dairy-eggs', bg: 'bg-blue-50 text-blue-800 border-blue-100', icon: '🥛', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&auto=format&fit=crop&q=80' },
  { name: 'Daily Essentials', count: '15 Products', slug: 'essentials', bg: 'bg-amber-50 text-amber-800 border-amber-100', icon: '🍞', image: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=500&auto=format&fit=crop&q=80' },
  { name: 'Organic Specials', count: '10 Products', slug: 'organic', bg: 'bg-teal-50 text-teal-800 border-teal-100', icon: '🥬', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=80' },
  { name: 'Beverages', count: '8 Products', slug: 'beverages', bg: 'bg-cyan-50 text-cyan-800 border-cyan-100', icon: '🍹', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80' },
  { name: 'Snacks & Nuts', count: '14 Products', slug: 'snacks', bg: 'bg-rose-50 text-rose-800 border-rose-100', icon: '🥜', image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bb087?w=500&auto=format&fit=crop&q=80' },
  { name: 'Pantry Groceries', count: '20 Products', slug: 'groceries', bg: 'bg-orange-50 text-orange-800 border-orange-100', icon: '🍯', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80' }
];

// Testimonials Data
const testimonials = [
  { name: 'Ananya Sharma', role: 'Homemaker', rating: 5, quote: 'Pure O Fresh has completely transformed my daily grocery shopping! The leafy vegetables are incredibly crisp and arrive within 45 minutes. The organic eggs have the richest yellow yolks I have seen.', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80' },
  { name: 'Rahul Verma', role: 'Software Engineer', rating: 5, quote: 'Absolutely love their express delivery! In Bangalore tech life, finding time for fresh markets is hard. Pure O Fresh delivers standard farm-grade organic milk and fresh fruits early morning without fail.', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
  { name: 'Dr. Shruti Kapoor', role: 'Nutritionist', rating: 5, quote: 'I recommend Pure O Fresh to all my clients. Their quality check standards are outstanding. You can tell they actually source from organic fields. Zero chemical coating, just pure nature.', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80' }
];

export default function Home() {
  const router = useRouter();
  const isHydrated = useHydrated();

  // Zustand
  const adminProducts = useStore((state) => state.adminProducts);
  const addToCart = useStore((state) => state.addToCart);
  const toggleWishlist = useStore((state) => state.toggleWishlist);
  const inWishlist = useStore((state) => state.inWishlist);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const nextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  // Extract featured products
  const featuredProducts = adminProducts.filter(p => p.isFeatured).slice(0, 4);

  return (
    <div className="overflow-x-hidden font-sans">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-24 bg-gradient-to-br from-primary-dark via-[#095E35] to-[#042D19] overflow-hidden text-white">
        
        {/* Floating Fruit Elements - Animated with Framer Motion */}
        <div className="absolute inset-0 pointer-events-none z-10 select-none overflow-hidden">
          {/* Apple */}
          <motion.div 
            animate={{ y: [0, -15, 0], rotate: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className="absolute top-[20%] left-[8%] text-4xl opacity-75 hidden md:block"
          >
            🍎
          </motion.div>
          {/* Avocado */}
          <motion.div 
            animate={{ y: [0, 15, 0], rotate: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-[25%] left-[12%] text-4xl opacity-75 hidden md:block"
          >
            🥑
          </motion.div>
          {/* Broccoli */}
          <motion.div 
            animate={{ y: [0, -12, 0], rotate: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 0.5 }}
            className="absolute top-[25%] right-[10%] text-4xl opacity-75 hidden md:block"
          >
            🥦
          </motion.div>
          {/* Strawberry */}
          <motion.div 
            animate={{ y: [0, 18, 0], rotate: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 8, ease: "easeInOut", delay: 1.5 }}
            className="absolute bottom-[30%] right-[15%] text-4xl opacity-75 hidden md:block"
          >
            🍓
          </motion.div>
          {/* Lemon */}
          <motion.div 
            animate={{ y: [0, -10, 0], rotate: [0, 15, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 2 }}
            className="absolute top-[65%] left-[45%] text-3xl opacity-50 hidden md:block"
          >
            🍋
          </motion.div>
        </div>

        {/* Hero Background Texture */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-10 mix-blend-overlay"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1542838132-92c53300491e?w=1600&auto=format&fit=crop&q=80')` }}
        />

        {/* Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 md:py-20 relative z-20 flex flex-col items-center text-center">
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-secondary text-xs sm:text-sm font-bold tracking-wide uppercase mb-6"
          >
            <Sparkles className="h-4 w-4 text-secondary animate-pulse" />
            100% Organic & Farm Fresh Guarantee
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight max-w-4xl leading-tight sm:leading-none"
          >
            Farm Fresh Fruits & Vegetables <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              Delivered directly to your Doorstep
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-6 text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl font-medium leading-relaxed"
          >
            Experience premium, hand-picked organic produce sourced from local farmers. Quality checked, washed with care, and delivered fresh to you in under 1 hour.
          </motion.p>

          {/* Hero Search Bar */}
          <motion.form
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            onSubmit={handleSearchSubmit}
            className="mt-8 max-w-2xl w-full flex flex-col sm:flex-row gap-2 bg-white/10 p-2 rounded-2xl sm:rounded-full border border-white/20 backdrop-blur-lg"
          >
            <div className="relative flex-grow flex items-center">
              <Search className="absolute left-4 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="What fresh essentials are you looking for today?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white text-slate-800 pl-12 pr-4 py-3 rounded-xl sm:rounded-full outline-none text-sm font-medium"
              />
            </div>
            <button
              type="submit"
              className="px-8 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl sm:rounded-full text-sm font-bold shadow-lg hover:shadow-primary/30 transition transform hover:-translate-y-0.5"
            >
              Search
            </button>
          </motion.form>

          {/* Quick CTAs & Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-8 flex flex-wrap justify-center gap-4 text-sm font-semibold"
          >
            <Link 
              href="/products" 
              className="px-6 py-3 bg-secondary hover:bg-accent text-white rounded-full flex items-center gap-2 transition transform hover:-translate-y-0.5 shadow-md"
            >
              Order Now
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a 
              href="#categories" 
              className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-full transition transform hover:-translate-y-0.5"
            >
              Explore Categories
            </a>
          </motion.div>

        </div>
      </section>

      {/* 2. CATEGORIES SECTION */}
      <section id="categories" className="py-16 md:py-24 bg-[#F8FAF7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12">
            <div>
              <span className="text-primary font-bold text-xs uppercase tracking-widest block mb-2">Shop by Category</span>
              <h2 className="font-display text-3xl font-extrabold text-slate-850">Explore Our Organic Fields</h2>
            </div>
            <Link href="/categories" className="text-primary hover:text-primary-dark text-sm font-bold flex items-center gap-1 mt-4 sm:mt-0 transition group">
              View All Categories
              <ArrowRight className="h-4.5 w-4.5 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {homepageCategories.map((cat, i) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                key={cat.slug}
              >
                <Link
                  href={`/products?category=${cat.slug}`}
                  className="block group rounded-2xl bg-white border border-slate-100 p-4 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1.5 h-full flex flex-col justify-between"
                >
                  {/* Category Image Cover */}
                  <div className="h-28 rounded-xl overflow-hidden mb-4 relative bg-slate-50 shrink-0">
                    <img
                      src={cat.image || '/images/category-placeholder.png'}
                      alt={cat.name}
                      className="h-full w-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/category-placeholder.png';
                      }}
                    />
                    <div className="absolute top-2 right-2 h-7 w-7 bg-white rounded-full shadow-md flex items-center justify-center text-sm font-bold">
                      {cat.icon}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-800 text-sm group-hover:text-primary transition">{cat.name}</h3>
                    <p className="text-slate-400 text-xs font-semibold mt-1">{cat.count}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* 3. DAILY DEALS SECTION */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Deal 1 */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="rounded-3xl p-8 relative overflow-hidden bg-[#0A4B2A] text-white flex flex-col justify-between min-h-[220px]"
            >
              <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-30 pointer-events-none">
                <img 
                  src="https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&auto=format&fit=crop&q=80" 
                  alt="greens" 
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="relative z-10 max-w-sm space-y-2">
                <span className="bg-[#FF6B00] text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">Midweek Special</span>
                <h3 className="text-xl sm:text-2xl font-extrabold font-display leading-tight">Fresh Organic Greens <br/> Buy 1 Get 1 Free!</h3>
                <p className="text-xs text-slate-300 font-medium">Get crispy organic baby spinach, romaine lettuce, & celery. Harvested fresh, delivered same day.</p>
              </div>
              <Link 
                href="/products?category=vegetables" 
                className="mt-6 self-start px-5 py-2.5 bg-white text-[#0A4B2A] hover:bg-slate-100 rounded-full text-xs font-bold transition transform hover:scale-105 shadow-md flex items-center gap-1.5"
              >
                Claim Deal
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </motion.div>

            {/* Deal 2 */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="rounded-3xl p-8 relative overflow-hidden bg-[#FF6B00] text-white flex flex-col justify-between min-h-[220px]"
            >
              <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-30 pointer-events-none">
                <img 
                  src="https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=300&auto=format&fit=crop&q=80" 
                  alt="mangoes" 
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="relative z-10 max-w-sm space-y-2">
                <span className="bg-[#0A4B2A] text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">Summer Fruits</span>
                <h3 className="text-xl sm:text-2xl font-extrabold font-display leading-tight">Sweet Mango Festival <br/> Up to 30% Off</h3>
                <p className="text-xs text-orange-100 font-medium">Sweet organic Alphonso, Kesar, and Banganapalli mangoes directly from standard groves.</p>
              </div>
              <Link 
                href="/products?category=fruits" 
                className="mt-6 self-start px-5 py-2.5 bg-white text-[#FF6B00] hover:bg-slate-100 rounded-full text-xs font-bold transition transform hover:scale-105 shadow-md flex items-center gap-1.5"
              >
                Shop Mangoes
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 4. FEATURED PRODUCTS SECTION */}
      <section className="py-16 bg-[#F8FAF7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12">
            <div>
              <span className="text-primary font-bold text-xs uppercase tracking-widest block mb-2">Top Picks</span>
              <h2 className="font-display text-3xl font-extrabold text-slate-850">Featured Fresh Items</h2>
            </div>
            <Link href="/products" className="text-primary hover:text-primary-dark text-sm font-bold flex items-center gap-1 mt-4 sm:mt-0 transition group">
              Shop All Products
              <ArrowRight className="h-4.5 w-4.5 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => {
              const discountPrice = product.price * (1 - product.discount / 100);
              const isWish = isHydrated && inWishlist(product.id);

              // Dynamic category badge
              const catObj = mockCategories.find(c => c.id === product.categoryId);
              const categoryBadgeName = catObj ? catObj.name.replace('Fresh ', '') : 'Pantry';

              // Dynamic reviews count
              const countReviews = mockReviews.filter(r => r.productId === product.id).length;
              const totalReviewCount = countReviews > 0 ? countReviews : Math.floor(product.rating * 5) + 3;

              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  key={product.id}
                  className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group relative h-full"
                >
                  {/* Image wrapper */}
                  <div className="h-44 relative bg-white overflow-hidden shrink-0 flex items-center justify-center p-4 border-b border-slate-100/50">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-contain transform group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80'; }}
                    />

                    {/* Discount badge */}
                    {product.discount > 0 && (
                      <span className="absolute top-3 left-3 bg-accent text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full z-20">
                        {product.discount}% OFF
                      </span>
                    )}

                    {/* Wishlist toggle */}
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className={`absolute top-3 right-3 p-1.5 rounded-full shadow-md transition transform active:scale-95 z-20 ${
                        isWish 
                          ? 'bg-rose-50 text-rose-500' 
                          : 'bg-white/80 hover:bg-white text-slate-500 hover:text-rose-500'
                      }`}
                      aria-label="Add to Wishlist"
                    >
                      <Heart className={`h-4 w-4 ${isWish ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Details */}
                  <div className="p-4 flex-grow flex flex-col justify-between">
                    <div className="space-y-2 flex-grow flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          {/* Category Badge */}
                          <span className="bg-emerald-50 text-emerald-800 text-[9px] font-extrabold px-2 py-0.5 rounded-md shrink-0">
                            {categoryBadgeName}
                          </span>
                          
                          {/* Rating and review count */}
                          <div className="flex items-center gap-0.5 text-amber-500 text-[10px] font-bold shrink-0">
                            <Star className="h-3 w-3 fill-current" />
                            <span>{product.rating}</span>
                            <span className="text-slate-400 font-semibold">({totalReviewCount})</span>
                          </div>
                        </div>

                        <Link 
                          href={`/products/${product.id}`} 
                          className="block font-bold text-slate-800 text-sm hover:text-primary transition line-clamp-2 h-10 leading-snug"
                        >
                          {product.name}
                        </Link>
                        <p className="text-[10px] text-slate-400 font-bold leading-none">{product.unit}</p>
                      </div>

                      <div className="flex items-center justify-between pt-3 mt-auto border-t border-slate-100 w-full shrink-0">
                        {/* Price */}
                        <div className="flex flex-col">
                          {product.discount > 0 && (
                            <span className="text-[9px] text-slate-400 line-through leading-none mb-0.5">₹{Math.round(product.price)}</span>
                          )}
                          <span className="text-sm font-extrabold text-slate-855">₹{Math.round(discountPrice)}</span>
                        </div>

                        {/* Add button */}
                        <button
                          onClick={() => addToCart(product, 1)}
                          className="flex items-center gap-1 bg-primary hover:bg-primary-dark text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-md transition active:scale-95 shrink-0"
                        >
                          <ShoppingBag className="h-3.5 w-3.5" />
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 5. WHY CHOOSE US SECTION */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-primary font-bold text-xs uppercase tracking-widest block mb-2">Our Promise</span>
            <h2 className="font-display text-3xl font-extrabold text-slate-850">Why Choose Pure O Fresh</h2>
            <p className="text-sm text-slate-500 font-semibold mt-3">We go the extra mile to bring the finest organic selections and premium services straight to your home.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-[#F8FAF7] border border-slate-100 hover:shadow-lg transition duration-300 text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto text-xl">
                🌱
              </div>
              <h3 className="font-bold text-slate-800 text-base">Farm Fresh Products</h3>
              <p className="text-slate-500 text-xs leading-relaxed font-medium">Sourced straight from standard certified organic farms. Plucked at the peak of ripeness, keeping all nutrients intact.</p>
            </div>
            
            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-[#F8FAF7] border border-slate-100 hover:shadow-lg transition duration-300 text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-orange-100 text-orange-800 flex items-center justify-center mx-auto text-xl">
                🚀
              </div>
              <h3 className="font-bold text-slate-800 text-base">Super Fast 1h Delivery</h3>
              <p className="text-slate-500 text-xs leading-relaxed font-medium">Our lightning-fast logistics fleet ensures order deliveries arrive within 1 hour. No compromise on speed.</p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-[#F8FAF7] border border-slate-100 hover:shadow-lg transition duration-300 text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center mx-auto text-xl">
                🔬
              </div>
              <h3 className="font-bold text-slate-800 text-base">100% Quality Checked</h3>
              <p className="text-slate-500 text-xs leading-relaxed font-medium">Every individual product goes through stringent multi-level quality tests for freshness, size, and organic purity.</p>
            </div>
          </div>

        </div>
      </section>

      {/* 6. HOW IT WORKS */}
      <section className="py-16 md:py-20 bg-[#F8FAF7] border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-primary font-bold text-xs uppercase tracking-widest block mb-2">Easy Steps</span>
            <h2 className="font-display text-3xl font-extrabold text-slate-850">How It Works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center space-y-4 relative z-10">
              <div className="h-16 w-16 rounded-full bg-primary text-white font-extrabold text-lg flex items-center justify-center shadow-lg">
                1
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Browse Products</h3>
              <p className="text-slate-500 text-xs leading-relaxed font-medium max-w-xs">Select from our wide range of organic fruits, vegetables, dairy products, and daily essentials.</p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center space-y-4 relative z-10">
              <div className="h-16 w-16 rounded-full bg-secondary text-white font-extrabold text-lg flex items-center justify-center shadow-lg">
                2
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Place Your Order</h3>
              <p className="text-slate-500 text-xs leading-relaxed font-medium max-w-xs">Fill in your address, choose a convenient delivery slot, and complete secure checkout in seconds.</p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center space-y-4 relative z-10">
              <div className="h-16 w-16 rounded-full bg-[#FF6B00] text-white font-extrabold text-lg flex items-center justify-center shadow-lg">
                3
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Get Fast Delivery</h3>
              <p className="text-slate-500 text-xs leading-relaxed font-medium max-w-xs">Our rider brings your fresh, sanitized box of organic goodness to your door within 60 minutes.</p>
            </div>

            {/* Background Line Connector for desktop */}
            <div className="absolute top-8 left-[15%] right-[15%] h-0.5 border-t border-dashed border-slate-350 hidden md:block z-0" />

          </div>

        </div>
      </section>

      {/* 7. TESTIMONIALS SECTION */}
      <section className="py-16 md:py-24 bg-white overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          
          <span className="text-primary font-bold text-xs uppercase tracking-widest block mb-2">Testimonials</span>
          <h2 className="font-display text-3xl font-extrabold text-slate-850 mb-12">Loved by Freshness Lovers</h2>

          <div className="bg-[#F8FAF7] rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100 relative min-h-[250px] flex flex-col justify-between">
            {/* Quotes Mark */}
            <div className="absolute top-6 left-6 text-7xl text-slate-200 font-serif leading-none select-none">“</div>
            
            <div className="relative z-10 space-y-6">
              <p className="text-slate-650 text-sm sm:text-base italic leading-relaxed font-medium">
                {testimonials[activeTestimonial].quote}
              </p>
              
              <div className="flex flex-col items-center gap-3">
                <img
                  src={testimonials[activeTestimonial].image}
                  alt={testimonials[activeTestimonial].name}
                  className="h-14 w-14 rounded-full border-2 border-primary object-cover shadow"
                />
                <div>
                  <h4 className="font-bold text-slate-800 text-sm leading-none">{testimonials[activeTestimonial].name}</h4>
                  <span className="text-[10px] text-slate-450 font-bold tracking-wide block mt-1">{testimonials[activeTestimonial].role}</span>
                </div>
                <div className="flex gap-0.5 text-amber-500">
                  {[...Array(testimonials[activeTestimonial].rating)].map((_, idx) => (
                    <Star key={idx} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
              </div>
            </div>

            {/* Slider Controls */}
            <div className="flex justify-center gap-3 mt-8">
              <button 
                onClick={prevTestimonial}
                className="p-2 rounded-full bg-white hover:bg-slate-50 shadow-md text-slate-700 hover:text-primary transition"
                aria-label="Previous Testimonial"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button 
                onClick={nextTestimonial}
                className="p-2 rounded-full bg-white hover:bg-slate-50 shadow-md text-slate-700 hover:text-primary transition"
                aria-label="Next Testimonial"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* 8. DOWNLOAD APP SECTION */}
      <section className="py-16 bg-[#0A4B2A] text-white overflow-hidden relative">
        {/* Background Sparkles */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
          
          <div className="lg:col-span-3 space-y-6">
            <span className="text-secondary font-bold text-xs uppercase tracking-widest block">Get the Pure O Fresh App</span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold leading-tight">Order Fresh Organic Groceries <br/> On the Go</h2>
            <p className="text-sm text-slate-300 leading-relaxed font-medium max-w-xl">
              Download our mobile app to experience the fastest, most convenient shopping experience. Save multiple addresses, live-track your delivery partners on interactive maps, claim app-only discounts, and place re-orders in one tap.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <a 
                href="#" 
                className="flex items-center gap-3 bg-white text-slate-800 px-5 py-2.5 rounded-xl hover:bg-slate-100 transition shadow-lg transform hover:-translate-y-0.5"
              >
                <Smartphone className="h-5 w-5 text-primary" />
                <div className="text-left leading-none">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Get it on</span>
                  <span className="text-xs font-bold font-display">Google Play</span>
                </div>
              </a>
              <a 
                href="#" 
                className="flex items-center gap-3 bg-white text-slate-800 px-5 py-2.5 rounded-xl hover:bg-slate-100 transition shadow-lg transform hover:-translate-y-0.5"
              >
                <Smartphone className="h-5 w-5 text-accent" />
                <div className="text-left leading-none">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Download on the</span>
                  <span className="text-xs font-bold font-display">App Store</span>
                </div>
              </a>
            </div>
          </div>

          {/* Simulated App Mockup */}
          <div className="lg:col-span-2 flex justify-center relative">
            
            {/* Floating leaf next to app */}
            <motion.span 
              animate={{ y: [0, 8, 0], rotate: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute top-10 left-4 text-3xl z-20"
            >
              🥬
            </motion.span>

            {/* Mobile Screen Mockup */}
            <div className="w-56 h-[380px] bg-slate-900 rounded-[36px] p-2.5 border-4 border-slate-700 shadow-2xl relative overflow-hidden">
              <div className="w-20 h-4 bg-slate-750 absolute top-0 left-1/2 transform -translate-x-1/2 rounded-b-xl z-20 flex items-center justify-center">
                <span className="h-1.5 w-1.5 bg-black rounded-full" />
              </div>
              
              {/* App Screen Inside */}
              <div className="h-full w-full bg-slate-50 rounded-[28px] overflow-hidden flex flex-col justify-between text-slate-800 text-[9px] p-2 pt-5">
                {/* Simulated App Header */}
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1 font-bold text-primary">
                    <span>Pure O Fresh</span>
                  </div>
                  <ShoppingBag className="h-3.5 w-3.5 text-slate-400" />
                </div>

                {/* Simulated Content */}
                <div className="flex-1 overflow-y-auto space-y-2 py-2">
                  {/* Banner */}
                  <div className="bg-primary text-white p-2 rounded-xl text-center font-bold">
                    1 Hour Delivery to Indiranagar
                  </div>
                  {/* Category */}
                  <div className="flex justify-between font-bold">
                    <span>Popular Organic Greens</span>
                    <span className="text-primary">See all</span>
                  </div>
                  {/* Card list */}
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="bg-white border border-slate-150 p-1.5 rounded-lg text-center space-y-1">
                      <div className="h-10 bg-slate-100 rounded-md overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=150&auto=format&fit=crop&q=80" alt="spinach" className="h-full w-full object-cover"/>
                      </div>
                      <p className="font-bold text-[8px] truncate leading-none">Fresh Spinach</p>
                      <p className="text-[7px] text-slate-400 font-semibold">₹49</p>
                      <span className="bg-primary text-white py-0.5 px-1 rounded-md font-bold block text-[7px] cursor-default">Add to Cart</span>
                    </div>
                    <div className="bg-white border border-slate-150 p-1.5 rounded-lg text-center space-y-1">
                      <div className="h-10 bg-slate-100 rounded-md overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=150&auto=format&fit=crop&q=80" alt="apples" className="h-full w-full object-cover"/>
                      </div>
                      <p className="font-bold text-[8px] truncate leading-none">Gala Apples</p>
                      <p className="text-[7px] text-slate-400 font-semibold">₹199</p>
                      <span className="bg-primary text-white py-0.5 px-1 rounded-md font-bold block text-[7px] cursor-default">Add to Cart</span>
                    </div>
                  </div>
                </div>

                {/* Simulated App Footer */}
                <div className="flex justify-around items-center pt-1.5 border-t border-slate-150 bg-white">
                  <span className="text-primary font-bold text-[8px]">Home</span>
                  <span className="text-slate-400 text-[8px]">Shop</span>
                  <span className="text-slate-400 text-[8px]">Track</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
}

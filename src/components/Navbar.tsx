'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { useHydrated } from '@/hooks/useHydrated';
import { mockProducts } from '@/lib/mockData';
import Logo from './Logo';
import { useUser, useClerk } from '@clerk/nextjs';
import { syncUserAction } from '@/actions/auth';
import { 
  Search, 
  ShoppingBag, 
  Heart, 
  User, 
  Bell, 
  Menu, 
  X, 
  ChevronDown, 
  LogOut, 
  LayoutDashboard, 
  Settings, 
  Plus, 
  Minus,
  Trash2,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const isHydrated = useHydrated();

  // Zustand State
  const user = useStore((state) => state.user);
  const cart = useStore((state) => state.cart);
  const wishlist = useStore((state) => state.wishlist);
  const notifications = useStore((state) => state.notifications);
  const markNotifsRead = useStore((state) => state.markNotificationsAsRead);
  const clearNotifs = useStore((state) => state.clearNotifications);
  
  const getCartCount = useStore((state) => state.getCartCount);
  const updateCartQty = useStore((state) => state.updateQuantity);
  const removeFromCart = useStore((state) => state.removeFromCart);
  const getCartTotal = useStore((state) => state.getCartTotal);
  const getCartSubtotal = useStore((state) => state.getCartSubtotal);
  const getCartDiscount = useStore((state) => state.getCartDiscount);

  const adminProducts = useStore((state) => state.adminProducts);
  const resetCatalog = useStore((state) => state.resetCatalog);

  const { user: clerkUser, isSignedIn, isLoaded } = useUser();
  const { signOut } = useClerk();

  // Sync Clerk session with Zustand and PostgreSQL database
  useEffect(() => {
    if (!isHydrated || !isLoaded) return;

    if (isSignedIn && clerkUser) {
      // Call Server Action to sync user in database
      syncUserAction().then((res) => {
        if (res.success && res.user) {
          // Sync into Zustand store
          useStore.setState({
            user: {
              name: res.user.fullName,
              email: res.user.email,
              phone: res.user.phone || '',
              role: res.user.role === 'CUSTOMER' ? 'USER' : 'ADMIN',
            },
          });
        } else if (res.error) {
          console.error('Failed to sync session:', res.error);
        }
      });
    } else {
      // User is logged out of Clerk, clear Zustand store user session
      useStore.setState({ user: null });
    }
  }, [isHydrated, isLoaded, isSignedIn, clerkUser]);

  // Global catalog audit refresh to ensure browser pulls new studio images
  useEffect(() => {
    if (isHydrated) {
      const tomato = adminProducts.find(p => p.id === 'prod-13');
      const correctTomatoImg = mockProducts.find(p => p.id === 'prod-13')?.image;
      if (!tomato || tomato.image !== correctTomatoImg || adminProducts.length < 24) {
        resetCatalog();
      }
    }
  }, [isHydrated, adminProducts, resetCatalog]);

  // Component States
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  
  // Dropdowns States
  const [profileOpen, setProfileOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [notifsOpen, setNotifsOpen] = useState(false);

  // Refs for closing dropdowns
  const profileRef = useRef<HTMLDivElement>(null);
  const notifsRef = useRef<HTMLDivElement>(null);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on click outside
  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (notifsRef.current && !notifsRef.current.contains(e.target as Node)) {
        setNotifsOpen(false);
      }
    };
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, []);

  // Close mobile menu on page change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchFocused(false);
    }
  };

  // Determine if navbar should overlay transparently over hero
  const isHome = pathname === '/';
  const navbarBg = scrolled 
    ? 'bg-white/95 shadow-md border-b border-slate-100 text-slate-800 py-3' 
    : isHome 
      ? 'bg-transparent text-white py-5' 
      : 'bg-white border-b border-slate-100 text-slate-800 py-4';

  const textTheme = scrolled 
    ? 'text-slate-700 hover:text-primary' 
    : isHome 
      ? 'text-white hover:text-secondary' 
      : 'text-slate-700 hover:text-primary';

  const iconColor = scrolled 
    ? 'text-slate-700 hover:text-primary hover:bg-slate-100' 
    : isHome 
      ? 'text-white hover:text-secondary hover:bg-white/10' 
      : 'text-slate-700 hover:text-primary hover:bg-slate-100';

  const unreadNotifsCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <header className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${navbarBg} font-sans`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Logo */}
          <Logo light={isHome && !scrolled} />

          {/* Search Bar - Desktop */}
          <form 
            onSubmit={handleSearchSubmit}
            className="hidden md:flex items-center relative max-w-md w-full mx-6 group"
          >
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search fresh fruits, vegetables, dairy..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                className={`w-full py-2 pl-10 pr-4 rounded-full border text-sm transition-all outline-none bg-slate-50 text-slate-800 ${
                  searchFocused 
                    ? 'border-primary ring-2 ring-primary/20 bg-white' 
                    : 'border-slate-200 focus:border-primary group-hover:border-slate-300'
                }`}
              />
              <Search className="absolute left-3.5 top-2.5 h-4.5 w-4.5 text-slate-400" />
            </div>
            {searchQuery && (
              <button 
                type="submit" 
                className="absolute right-2 px-3 py-1 rounded-full bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition"
              >
                Go
              </button>
            )}
          </form>

          {/* Navigation Links - Desktop */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold">
            <Link href="/products" className={`transition ${textTheme}`}>Shop</Link>
            <Link href="/categories" className={`transition ${textTheme}`}>Categories</Link>
            <Link href="/offers" className={`transition ${textTheme}`}>
              <span className="relative flex items-center gap-1">
                Offers
                <span className="absolute -top-3.5 -right-5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                </span>
              </span>
            </Link>
            <Link href="/about" className={`transition ${textTheme}`}>About</Link>
            <Link href="/contact" className={`transition ${textTheme}`}>Contact</Link>
          </nav>

          {/* User Icons and Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Search Toggle - Mobile only */}
            <Link 
              href="/products" 
              className="p-2 rounded-full md:hidden transition hover:bg-slate-100 text-current"
              aria-label="Search page"
            >
              <Search className="h-5 w-5" />
            </Link>

            {/* Notifications Dropdown */}
            <div className="relative" ref={notifsRef}>
              <button
                onClick={() => {
                  setNotifsOpen(!notifsOpen);
                  if (!notifsOpen) markNotifsRead();
                }}
                className={`p-2 rounded-full transition relative ${iconColor}`}
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                {isHydrated && unreadNotifsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 bg-accent text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                    {unreadNotifsCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {notifsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 text-slate-800"
                  >
                    <div className="p-4 bg-primary text-white flex justify-between items-center">
                      <h4 className="font-bold text-sm">Notifications</h4>
                      <div className="flex gap-2">
                        <button 
                          onClick={clearNotifs} 
                          className="text-[10px] bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded transition"
                        >
                          Clear All
                        </button>
                      </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                      {isHydrated && notifications.length > 0 ? (
                        notifications.map((notif) => (
                          <div key={notif.id} className="p-3 hover:bg-slate-50 transition">
                            <h5 className="font-bold text-xs text-slate-800 flex items-center justify-between">
                              {notif.title}
                              {!notif.read && <span className="h-1.5 w-1.5 bg-accent rounded-full"></span>}
                            </h5>
                            <p className="text-slate-600 text-[11px] mt-1">{notif.message}</p>
                            <span className="text-[9px] text-slate-400 block mt-2">
                              {new Date(notif.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="p-6 text-center text-slate-400 text-xs">
                          No notifications yet.
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Wishlist Link */}
            <Link
              href="/wishlist"
              className={`p-2 rounded-full transition relative ${iconColor} hidden sm:flex`}
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
              {isHydrated && wishlist.length > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-accent text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart Button */}
            <button
              onClick={() => setCartDrawerOpen(true)}
              className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5 text-sm font-bold"
              aria-label="Open Cart"
            >
              <ShoppingBag className="h-4.5 w-4.5" />
              <span>Cart</span>
              {isHydrated && getCartCount() > 0 && (
                <span className="bg-white text-primary text-xs font-extrabold px-2 py-0.5 rounded-full min-w-5 text-center">
                  {getCartCount()}
                </span>
              )}
            </button>

            {/* User Profile / Login Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className={`flex items-center gap-1 p-1.5 rounded-full transition border ${
                  scrolled 
                    ? 'border-slate-200 hover:border-primary text-slate-700 bg-slate-50' 
                    : isHome 
                      ? 'border-white/20 hover:border-white text-white bg-white/5' 
                      : 'border-slate-200 hover:border-primary text-slate-700 bg-slate-50'
                }`}
                aria-label="User Account"
              >
                <User className="h-4.5 w-4.5" />
                <ChevronDown className="h-3 w-3" />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 text-slate-800 font-sans"
                  >
                    {isHydrated && user ? (
                      <div className="divide-y divide-slate-100">
                        <div className="p-4">
                          <p className="text-xs text-slate-400">Signed in as</p>
                          <p className="font-bold text-sm text-slate-800 truncate">{user.name}</p>
                          <p className="text-xs text-slate-500 truncate mt-0.5">{user.email}</p>
                        </div>
                        <div className="p-2 flex flex-col">
                          <Link href="/profile" className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-primary/5 hover:text-primary rounded-lg transition">
                            <User className="h-4 w-4" /> My Profile
                          </Link>
                          <Link href="/profile?tab=orders" className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-primary/5 hover:text-primary rounded-lg transition">
                            <ShoppingBag className="h-4 w-4" /> My Orders
                          </Link>
                          <Link href="/wishlist" className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-primary/5 hover:text-primary rounded-lg transition">
                            <Heart className="h-4 w-4" /> Wishlist
                          </Link>
                          {user.role === 'ADMIN' && (
                            <Link href="/admin" className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 rounded-lg transition border border-dashed border-emerald-200 mt-1">
                              <LayoutDashboard className="h-4 w-4" /> Admin Dashboard
                            </Link>
                          )}
                        </div>
                        <div className="p-2">
                          <button
                            onClick={async () => {
                              await signOut();
                              useStore.getState().logout();
                              setProfileOpen(false);
                              window.location.href = '/';
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition text-left"
                          >
                            <LogOut className="h-4 w-4" /> Log Out
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 flex flex-col gap-2.5">
                        <p className="text-xs text-slate-500 text-center font-medium">Log in to track orders, manage addresses & save favorites!</p>
                        <Link
                          href="/login"
                          onClick={() => setProfileOpen(false)}
                          className="w-full text-center py-2 bg-primary hover:bg-primary-dark text-white rounded-full text-xs font-bold shadow transition"
                        >
                          Log In
                        </Link>
                        <Link
                          href="/register"
                          onClick={() => setProfileOpen(false)}
                          className="w-full text-center py-2 border border-slate-200 hover:border-slate-300 text-slate-700 rounded-full text-xs font-bold transition"
                        >
                          Create Account
                        </Link>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu Icon */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-full lg:hidden transition ${iconColor}`}
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden bg-white border-b border-slate-100 overflow-hidden text-slate-800"
            >
              <div className="px-4 py-4 space-y-3 flex flex-col">
                <Link href="/products" className="font-semibold text-sm hover:text-primary transition py-1">Shop all Products</Link>
                <Link href="/categories" className="font-semibold text-sm hover:text-primary transition py-1">Categories</Link>
                <Link href="/offers" className="font-semibold text-sm hover:text-primary transition py-1">Daily Offers</Link>
                <Link href="/about" className="font-semibold text-sm hover:text-primary transition py-1">About Us</Link>
                <Link href="/contact" className="font-semibold text-sm hover:text-primary transition py-1">Contact Us</Link>
                <Link href="/wishlist" className="font-semibold text-sm hover:text-primary transition py-1 flex items-center justify-between">
                  Wishlist
                  {isHydrated && wishlist.length > 0 && (
                    <span className="bg-accent text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                      {wishlist.length}
                    </span>
                  )}
                </Link>

                {/* Mobile Search */}
                <form onSubmit={handleSearchSubmit} className="relative pt-2">
                  <input
                    type="text"
                    placeholder="Search fresh groceries..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full py-2 pl-9 pr-4 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 bg-slate-50"
                  />
                  <Search className="absolute left-3 top-4.5 h-4.5 w-4.5 text-slate-400" />
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Cart Sliding Drawer Overlay */}
      <AnimatePresence>
        {cartDrawerOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden font-sans">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCartDrawerOpen(false)}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            />
            
            <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="w-screen max-w-md bg-white shadow-2xl flex flex-col"
              >
                {/* Header */}
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-primary text-white">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5" />
                    <h3 className="text-base font-bold">Your Cart</h3>
                    {isHydrated && cart.length > 0 && (
                      <span className="bg-white text-primary text-xs px-2 py-0.5 rounded-full font-extrabold">
                        {getCartCount()} Items
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setCartDrawerOpen(false)}
                    className="p-1 rounded-full hover:bg-white/20 transition text-white"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Cart Items List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {isHydrated && cart.length > 0 ? (
                    cart.map((item) => {
                      const discountPrice = item.product.price * (1 - item.product.discount / 100);
                      return (
                        <div key={item.product.id} className="flex gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100 relative group">
                          {/* Image */}
                          <div className="h-20 w-20 rounded-xl overflow-hidden bg-white border border-slate-100 flex items-center justify-center p-2 relative shrink-0">
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className="h-full w-full object-contain"
                              onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80'; }}
                            />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <h4 className="font-bold text-slate-800 text-sm truncate leading-tight">{item.product.name}</h4>
                              <p className="text-[11px] text-slate-500 font-semibold mt-0.5">{item.product.unit}</p>
                            </div>

                            <div className="flex items-center justify-between mt-2">
                              {/* Price */}
                              <div className="flex items-baseline gap-1.5">
                                 <span className="text-sm font-extrabold text-slate-800">₹{Math.round(discountPrice)}</span>
                                 {item.product.discount > 0 && (
                                   <span className="text-[10px] text-slate-400 line-through">₹{Math.round(item.product.price)}</span>
                                 )}
                              </div>

                              {/* Quantity Control */}
                              <div className="flex items-center gap-2 border border-slate-200 bg-white rounded-full p-1 shadow-sm">
                                <button
                                  onClick={() => updateCartQty(item.product.id, item.quantity - 1)}
                                  className="p-0.5 rounded-full hover:bg-slate-100 transition text-slate-600"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                                <button
                                  onClick={() => updateCartQty(item.product.id, item.quantity + 1)}
                                  className="p-0.5 rounded-full hover:bg-slate-100 transition text-slate-600"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Delete Item Button */}
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="absolute top-2 right-2 p-1.5 bg-rose-50 text-rose-500 rounded-full hover:bg-rose-100 transition opacity-0 group-hover:opacity-100 focus:opacity-100"
                            aria-label="Remove item"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-4">
                      <ShoppingBag className="h-16 w-16 text-slate-200 animate-pulse" />
                      <div className="text-center">
                        <p className="font-bold text-slate-700 text-sm">Your cart is empty</p>
                        <p className="text-xs text-slate-400 mt-1">Looks like you haven't added anything yet.</p>
                      </div>
                      <button
                        onClick={() => {
                          setCartDrawerOpen(false);
                          router.push('/products');
                        }}
                        className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-full text-xs font-bold transition shadow-md"
                      >
                        Start Shopping
                      </button>
                    </div>
                  )}
                </div>

                {/* Footer and Checkout Button */}
                {isHydrated && cart.length > 0 && (
                  <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-semibold text-slate-500">Subtotal:</span>
                      <span className="font-bold text-slate-800">₹{Math.round(getCartSubtotal())}</span>
                    </div>
                    {useStore.getState().coupon && (
                      <div className="flex justify-between items-center text-sm text-green-600 font-medium">
                        <span>Discount:</span>
                        <span>-₹{Math.round(getCartDiscount())}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-base border-t border-slate-200/60 pt-3">
                      <span className="font-bold text-slate-800">Total:</span>
                      <span className="text-lg font-extrabold text-primary">₹{Math.round(getCartTotal())}</span>
                    </div>

                    <div className="pt-2 flex gap-2">
                      <Link
                        href="/cart"
                        onClick={() => setCartDrawerOpen(false)}
                        className="flex-1 py-2.5 text-center text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-full text-xs font-bold transition"
                      >
                        View Full Cart
                      </Link>
                      <button
                        onClick={() => {
                          setCartDrawerOpen(false);
                          router.push('/checkout');
                        }}
                        className="flex-1 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-full text-xs font-bold text-center shadow-lg transition"
                      >
                        Proceed to Checkout
                      </button>
                    </div>
                    <p className="text-[10px] text-center text-slate-400 font-semibold">Free Delivery on orders above ₹499</p>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
export default Navbar;

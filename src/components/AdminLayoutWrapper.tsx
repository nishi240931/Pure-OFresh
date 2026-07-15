'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useClerk } from '@clerk/nextjs';
import { useStore } from '@/store/useStore';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Tag, 
  Truck, 
  Users, 
  TrendingUp, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  ChevronRight, 
  Home,
  User
} from 'lucide-react';

interface AdminLayoutWrapperProps {
  children: React.ReactNode;
  user: {
    fullName: string;
    email: string;
    profileImage: string | null;
  };
}

export default function AdminLayoutWrapper({ children, user }: AdminLayoutWrapperProps) {
  const pathname = usePathname();
  const { signOut } = useClerk();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: ShoppingBag },
    { name: 'Categories', path: '/admin/categories', icon: Tag },
    { name: 'Orders', path: '/admin/orders', icon: Truck },
    { name: 'Customers', path: '/admin/customers', icon: Users },
    { name: 'Analytics', path: '/admin/analytics', icon: TrendingUp },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await signOut();
      useStore.getState().logout();
      window.location.href = '/';
    } catch (err) {
      console.error('Failed to log out:', err);
    }
  };

  // Compute breadcrumbs
  const pathParts = pathname.split('/').filter(Boolean);
  const breadcrumbs = pathParts.map((part, index) => {
    const path = '/' + pathParts.slice(0, index + 1).join('/');
    const isLast = index === pathParts.length - 1;
    const formattedName = part.charAt(0).toUpperCase() + part.slice(1);
    return { name: formattedName, path, isLast };
  });

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-[260px] bg-slate-900 text-slate-300 border-r border-slate-800 shrink-0">
        {/* Brand header */}
        <div className="h-16 px-6 border-b border-slate-800 flex items-center gap-2 bg-slate-950">
          <span className="text-xl font-extrabold font-display tracking-tight text-white flex items-center gap-1.5">
            <span className="text-emerald-500 font-black">O</span> Fresh <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Admin</span>
          </span>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition ${
                  isActive 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/10' 
                    : 'hover:bg-slate-800 hover:text-white text-slate-400'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer Log out */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition text-left"
          >
            <LogOut className="h-4.5 w-4.5" />
            Log Out
          </button>
        </div>
      </aside>

      {/* MOBILE DRAWER SIDEBAR */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-slate-900/80 backdrop-blur-sm">
          <div className="w-[260px] bg-slate-900 text-slate-300 flex flex-col h-full shadow-2xl animate-slide-in">
            <div className="h-16 px-6 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <span className="text-xl font-extrabold font-display tracking-tight text-white flex items-center gap-1.5">
                <span className="text-emerald-500 font-black">O</span> Fresh
              </span>
              <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              {menuItems.map((item) => {
                const isActive = pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition ${
                      isActive 
                        ? 'bg-emerald-600 text-white' 
                        : 'hover:bg-slate-800 hover:text-white text-slate-400'
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-slate-800 bg-slate-950/40">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition text-left"
              >
                <LogOut className="h-4.5 w-4.5" />
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONTENT AREA WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* TOP NAVBAR */}
        <header className="h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-6 shrink-0 relative z-30 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <Menu className="h-5.5 w-5.5" />
            </button>
            
            {/* Desktop Breadcrumbs */}
            <nav className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-400">
              <Link href="/" className="hover:text-slate-600 flex items-center gap-1">
                <Home className="h-3.5 w-3.5" />
              </Link>
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={crumb.path}>
                  <ChevronRight className="h-3 w-3 text-slate-300" />
                  {crumb.isLast ? (
                    <span className="text-slate-800 font-extrabold">{crumb.name}</span>
                  ) : (
                    <Link href={crumb.path} className="hover:text-slate-600">{crumb.name}</Link>
                  )}
                </React.Fragment>
              ))}
            </nav>
          </div>

          {/* Topbar Right Profiles */}
          <div className="flex items-center gap-3 relative">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-800">{user.fullName}</p>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{user.email}</p>
            </div>

            <button 
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="h-9 w-9 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 flex items-center justify-center overflow-hidden focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              {user.profileImage ? (
                <img src={user.profileImage} alt={user.fullName} className="h-full w-full object-cover" />
              ) : (
                <User className="h-4.5 w-4.5" />
              )}
            </button>

            {/* Profile Dropdown */}
            {profileDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setProfileDropdownOpen(false)} />
                <div className="absolute right-0 top-11 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 text-xs font-semibold text-slate-700 animate-fade-in">
                  <div className="px-4 py-2 border-b border-slate-100 sm:hidden">
                    <p className="font-bold text-slate-800">{user.fullName}</p>
                    <p className="text-[9px] text-slate-400 uppercase tracking-wider">{user.email}</p>
                  </div>
                  <Link 
                    href="/" 
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 transition"
                  >
                    <Home className="h-4 w-4 text-slate-400" /> Back to Store
                  </Link>
                  <button 
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 hover:bg-rose-50 text-rose-600 transition text-left"
                  >
                    <LogOut className="h-4 w-4" /> Log Out
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* MAIN PAGE CHILDS */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>

    </div>
  );
}

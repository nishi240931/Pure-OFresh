'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { useHydrated } from '@/hooks/useHydrated';
import { 
  User, 
  ShoppingBag, 
  MapPin, 
  Heart, 
  Bell, 
  Settings, 
  LogOut, 
  Check, 
  Phone, 
  Mail, 
  Trash2,
  Calendar,
  Building,
  Clock,
  ArrowRight,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useClerk } from '@clerk/nextjs';

const ProfileContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isHydrated = useHydrated();
  const { signOut } = useClerk();

  // Zustand State
  const user = useStore((state) => state.user);
  const addresses = useStore((state) => state.addresses);
  const addAddress = useStore((state) => state.addAddress);
  const deleteAddress = useStore((state) => state.deleteAddress);
  const orders = useStore((state) => state.orders);
  const fetchOrders = useStore((state) => state.fetchOrders);
  const cancelOrderOnServer = useStore((state) => state.cancelOrderOnServer);
  const wishlist = useStore((state) => state.wishlist);
  const adminProducts = useStore((state) => state.adminProducts);
  const toggleWishlist = useStore((state) => state.toggleWishlist);
  const addToCart = useStore((state) => state.addToCart);
  const notifications = useStore((state) => state.notifications);

  const handleCancelOrder = async (orderId: string) => {
    if (confirm('Are you sure you want to cancel this order?')) {
      const res = await cancelOrderOnServer(orderId);
      if (!res.success) {
        alert(res.message || 'Failed to cancel order.');
      }
    }
  };

  // Profile Form States
  const [nameInput, setNameInput] = useState(user?.name || '');
  const [emailInput, setEmailInput] = useState(user?.email || '');
  const [phoneInput, setPhoneInput] = useState(user?.phone || '');
  const [profileUpdated, setProfileUpdated] = useState(false);

  // Address Form States
  const [isAddingAddr, setIsAddingAddr] = useState(false);
  const [addrTitle, setAddrTitle] = useState('Home');
  const [addrName, setAddrName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrCity, setAddrCity] = useState('Bengaluru');
  const [addrState, setAddrState] = useState('Karnataka');
  const [addrZip, setAddrZip] = useState('');

  // Active tab state
  const [activeTab, setActiveTab] = useState<string>('profile');

  // Handle redirect if not logged in
  useEffect(() => {
    if (isHydrated && !user) {
      router.push('/login');
    }
  }, [isHydrated, user]);

  // Synchronize form states on hydration
  useEffect(() => {
    if (user) {
      setNameInput(user.name);
      setEmailInput(user.email);
      setPhoneInput(user.phone);
    }
  }, [user]);

  // Fetch latest orders list on mount/sync
  useEffect(() => {
    if (user) {
      fetchOrders().catch((err) => {
        console.error('Failed to load orders history:', err);
      });
    }
  }, [user, fetchOrders]);

  // Initialize active tab from search params
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput && emailInput && phoneInput) {
      // Simulate profile update in state
      useStore.setState((state) => ({
        user: state.user ? { ...state.user, name: nameInput, email: emailInput, phone: phoneInput } : null
      }));
      setProfileUpdated(true);
      setTimeout(() => setProfileUpdated(false), 4000);
    }
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (addrName && addrPhone && addrStreet && addrZip) {
      addAddress({
        title: addrTitle,
        name: addrName,
        phone: addrPhone,
        streetAddress: addrStreet,
        city: addrCity,
        state: addrState,
        zipCode: addrZip,
        isDefault: false
      });
      setIsAddingAddr(false);
      // reset
      setAddrName('');
      setAddrPhone('');
      setAddrStreet('');
      setAddrZip('');
    }
  };

  const getOrderStatusColor = (status: string) => {
    if (status === 'DELIVERED') return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (status === 'CANCELLED') return 'bg-rose-100 text-rose-800 border-rose-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const getOrderProgressPercentage = (status: string) => {
    if (status === 'PLACED') return 20;
    if (status === 'PROCESSING') return 40;
    if (status === 'PACKING') return 60;
    if (status === 'SHIPPED') return 80;
    if (status === 'DELIVERED') return 100;
    return 0; // Cancelled
  };

  if (!isHydrated || !user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center text-slate-400">
        <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
      </div>
    );
  }

  // Filter wishlist items
  const wishlistProducts = adminProducts.filter(p => wishlist.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 min-h-[85vh] font-sans text-slate-800">
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* LEFT COLUMN: SIDEBAR */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm space-y-6">
            
            {/* User Info Brief */}
            <div className="text-center space-y-2">
              <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto font-display text-xl font-bold">
                {user.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm leading-none">{user.name}</h3>
                <span className="text-[10px] text-slate-400 font-bold block mt-1 uppercase tracking-wider">{user.role} Account</span>
              </div>
            </div>

            {/* Sidebar navigation tabs */}
            <div className="flex flex-col gap-1 text-xs font-semibold text-slate-650">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl transition ${
                  activeTab === 'profile' ? 'bg-primary text-white' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <User className="h-4 w-4" /> My Profile
              </button>
              
              <button
                onClick={() => setActiveTab('orders')}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition ${
                  activeTab === 'orders' ? 'bg-primary text-white' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" /> My Orders
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'orders' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {orders.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('addresses')}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl transition ${
                  activeTab === 'addresses' ? 'bg-primary text-white' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <MapPin className="h-4 w-4" /> Saved Addresses
              </button>

              <button
                onClick={() => setActiveTab('wishlist')}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition ${
                  activeTab === 'wishlist' ? 'bg-primary text-white' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Heart className="h-4 w-4" /> Wishlist
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'wishlist' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {wishlist.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('notifications')}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl transition ${
                  activeTab === 'notifications' ? 'bg-primary text-white' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Bell className="h-4 w-4" /> Notifications
              </button>

              {user.role === 'ADMIN' && (
                <Link href="/admin" className="flex items-center gap-2 px-3.5 py-2.5 border border-dashed border-emerald-200 hover:bg-emerald-50 rounded-xl transition mt-2 text-emerald-800">
                  <Settings className="h-4 w-4" /> Admin Console
                </Link>
              )}

              <button
                onClick={async () => {
                  await signOut();
                  useStore.getState().logout();
                  window.location.href = '/';
                }}
                className="flex items-center gap-2 px-3.5 py-2.5 hover:bg-rose-50 text-rose-600 rounded-xl transition mt-4"
              >
                <LogOut className="h-4 w-4" /> Log Out
              </button>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: TAB VIEW CONTENT */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* TAB 1: Profile View */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6">
              <div>
                <h2 className="font-display text-xl font-extrabold text-slate-800">Account Details</h2>
                <p className="text-xs text-slate-400 font-semibold mt-1">Manage your default contact information.</p>
              </div>

              {profileUpdated && (
                <p className="text-xs text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl">
                  ✓ Profile settings updated successfully in storage!
                </p>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Receiver Name</label>
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs outline-none focus:border-primary text-slate-800 font-semibold"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs outline-none focus:border-primary text-slate-800 font-semibold"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs outline-none focus:border-primary text-slate-800 font-semibold"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-full text-xs font-bold transition shadow"
                >
                  Save Settings
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: Orders History */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-xl font-extrabold text-slate-800">Your Orders History</h2>
                <p className="text-xs text-slate-400 font-semibold mt-1">Live track status and details of past checkouts.</p>
              </div>

              {orders.length > 0 ? (
                <div className="space-y-6">
                  {orders.map((order) => {
                    const progressVal = getOrderProgressPercentage(order.status);
                    return (
                      <div key={order.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 sm:p-6 space-y-6 relative overflow-hidden">
                        
                        {/* Order Header summary */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold block uppercase">Order Number</span>
                            <span className="font-bold text-slate-800 text-sm">{order.orderNumber || order.id}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold block uppercase">Date Placed</span>
                            <span className="font-semibold text-slate-650 text-xs flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {new Date(order.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold block uppercase">Total Amount</span>
                            <span className="font-extrabold text-primary text-sm">₹{Math.round(order.total).toLocaleString('en-IN')}</span>
                          </div>
                          <div>
                            <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border ${getOrderStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </div>
                        </div>

                        {/* Order Timeline Status Tracker (Progress Bar) */}
                        {order.status !== 'CANCELLED' && (
                          <div className="space-y-3 pt-2 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                            <p className="text-[9px] text-slate-400 font-extrabold uppercase">Live Order Tracker</p>
                            
                            <div className="relative pt-1">
                              <div className="overflow-hidden h-1.5 text-xs flex rounded bg-slate-200">
                                <div 
                                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary transition-all duration-1000"
                                  style={{ width: `${progressVal}%` }}
                                />
                              </div>

                              <div className="flex justify-between text-[8px] font-bold text-slate-400 mt-2">
                                <span className={progressVal >= 20 ? 'text-primary font-extrabold' : ''}>PLACED</span>
                                <span className={progressVal >= 40 ? 'text-primary font-extrabold' : ''}>PROCESSING</span>
                                <span className={progressVal >= 60 ? 'text-primary font-extrabold' : ''}>PACKING</span>
                                <span className={progressVal >= 80 ? 'text-primary font-extrabold' : ''}>SHIPPED</span>
                                <span className={progressVal >= 100 ? 'text-primary font-extrabold' : ''}>DELIVERED</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Items Sublist */}
                        <div className="space-y-3">
                          <p className="text-[9px] text-slate-400 font-extrabold uppercase">Products in Shipment</p>
                          <div className="divide-y divide-slate-100">
                            {order.items.map((item) => (
                              <div key={item.id} className="py-2.5 first:pt-0 flex justify-between items-center text-xs font-semibold text-slate-650">
                                <div className="flex items-center gap-2">
                                  <img src={item.productImage} alt={item.productName} className="h-8 w-8 rounded-lg object-cover border border-slate-100 shrink-0" />
                                  <span>{item.productName}</span>
                                </div>
                                <div className="flex gap-4">
                                  <span className="text-slate-400">Qty: {item.quantity}</span>
                                  <span className="text-slate-800 font-extrabold">₹{Math.round(item.price * item.quantity).toLocaleString('en-IN')}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Address and Delivery Details */}
                        {order.address && (
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-slate-600">
                            <div>
                              <p className="text-[9px] text-slate-400 font-extrabold uppercase">Delivery Location</p>
                              <p className="font-bold text-slate-700 mt-1">{order.address.name} ({order.address.phone})</p>
                              <p className="text-[11px] text-slate-500 font-semibold mt-0.5 leading-tight">{order.address.streetAddress}, {order.address.city}, {order.address.state} - {order.address.zipCode}</p>
                            </div>
                            <div>
                              <p className="text-[9px] text-slate-400 font-extrabold uppercase">Delivery Schedule</p>
                              <p className="font-bold text-slate-700 mt-1">{order.deliverySlot}</p>
                              <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Payment Method: <span className="font-bold text-slate-700">{order.paymentMethod}</span></p>
                            </div>
                          </div>
                        )}

                        {/* Cancellation trigger button */}
                        {(order.status === 'PLACED' || order.status === 'PROCESSING') && (
                          <div className="flex justify-end pt-4 border-t border-slate-100">
                            <button
                              type="button"
                              onClick={() => handleCancelOrder(order.id)}
                              className="px-5 py-2 border border-rose-250 hover:bg-rose-50 text-rose-600 rounded-full text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                            >
                              Cancel Order
                            </button>
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm flex flex-col items-center gap-4 text-slate-400">
                  <ShoppingBag className="h-14 w-14 text-slate-200" />
                  <p className="font-bold text-slate-700 text-xs">No orders recorded yet</p>
                  <Link href="/products" className="px-5 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-full transition shadow">
                    Shop Now
                  </Link>
                </div>
              )}

            </div>
          )}

          {/* TAB 3: Saved Addresses */}
          {activeTab === 'addresses' && (
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div>
                  <h2 className="font-display text-xl font-extrabold text-slate-800">Saved Addresses</h2>
                  <p className="text-xs text-slate-400 font-semibold mt-1">Manage billing and delivery address points.</p>
                </div>
                <button
                  onClick={() => setIsAddingAddr(!isAddingAddr)}
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-full text-xs font-bold transition shadow"
                >
                  {isAddingAddr ? 'Cancel' : 'Add New'}
                </button>
              </div>

              {isAddingAddr && (
                <form onSubmit={handleAddAddress} className="space-y-4 border border-dashed border-slate-200 p-5 rounded-2xl bg-slate-50">
                  <h3 className="font-bold text-slate-850 text-xs">New Address Form</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Title (e.g. Home, Work)</label>
                      <input
                        type="text"
                        value={addrTitle}
                        onChange={(e) => setAddrTitle(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white text-xs px-3 py-2 outline-none focus:border-primary text-slate-800 font-semibold"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Receiver Name</label>
                      <input
                        type="text"
                        value={addrName}
                        onChange={(e) => setAddrName(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white text-xs px-3 py-2 outline-none focus:border-primary text-slate-800 font-semibold"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Contact Phone</label>
                      <input
                        type="tel"
                        value={addrPhone}
                        onChange={(e) => setAddrPhone(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white text-xs px-3 py-2 outline-none focus:border-primary text-slate-800 font-semibold"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Zip Code</label>
                      <input
                        type="text"
                        value={addrZip}
                        onChange={(e) => setAddrZip(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white text-xs px-3 py-2 outline-none focus:border-primary text-slate-800 font-semibold"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Street Address</label>
                    <input
                      type="text"
                      placeholder="Flat/house number, building, street..."
                      value={addrStreet}
                      onChange={(e) => setAddrStreet(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white text-xs px-3 py-2 outline-none focus:border-primary text-slate-800 font-semibold"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white rounded-full text-xs font-bold transition shadow"
                  >
                    Save Address
                  </button>
                </form>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div key={addr.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 font-extrabold text-[10px] text-slate-805 uppercase">
                        <Building className="h-3.5 w-3.5 text-slate-400" />
                        {addr.title}
                        {addr.isDefault && (
                          <span className="text-[8px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded ml-2">Default</span>
                        )}
                      </div>
                      <p className="font-bold text-xs mt-2 text-slate-700">{addr.name}</p>
                      <p className="text-[11px] text-slate-550 leading-relaxed mt-1 font-semibold">
                        {addr.streetAddress}, {addr.city}, {addr.state} - {addr.zipCode}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-4 border-t border-slate-200/50 pt-3 text-[10px] text-slate-400 font-bold">
                      <div className="flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5" />
                        <span>{addr.phone}</span>
                      </div>
                      <button
                        onClick={() => deleteAddress(addr.id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-full transition"
                        aria-label="Delete address"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Wishlist */}
          {activeTab === 'wishlist' && (
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6">
              <div>
                <h2 className="font-display text-xl font-extrabold text-slate-800">Your Favorite Wishlist</h2>
                <p className="text-xs text-slate-400 font-semibold mt-1">Products bookmarked for later purchases.</p>
              </div>

              {wishlistProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 animate-fade-in">
                  {wishlistProducts.map((p) => {
                    const priceDisc = p.price * (1 - p.discount / 100);
                    return (
                      <div key={p.id} className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 flex flex-col justify-between group relative p-3">
                        <button
                          onClick={() => toggleWishlist(p.id)}
                          className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-rose-50 text-rose-500 shadow-sm transition transform active:scale-95"
                          aria-label="Remove from wishlist"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        
                        <div className="space-y-2">
                          <div className="h-32 bg-white rounded-xl overflow-hidden border border-slate-100">
                            <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                          </div>
                          
                          <div>
                            <Link href={`/products/${p.id}`} className="font-bold text-slate-800 text-xs hover:text-primary transition leading-none truncate block">
                              {p.name}
                            </Link>
                            <span className="text-[9px] text-slate-400 font-bold block mt-0.5">{p.unit}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-150">
                          <span className="text-xs font-extrabold text-slate-800">₹{Math.round(priceDisc)}</span>
                          <button
                            onClick={() => addToCart(p, 1)}
                            className="p-1.5 bg-primary hover:bg-primary-dark text-white rounded-full transition shadow-sm"
                            aria-label="Add to cart"
                          >
                            <ShoppingBag className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs font-medium">
                  Your wishlist is empty. Explore items and tap the heart icon to save favorites.
                </div>
              )}
            </div>
          )}

          {/* TAB 5: Notifications List */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6">
              <div>
                <h2 className="font-display text-xl font-extrabold text-slate-800">Notifications</h2>
                <p className="text-xs text-slate-400 font-semibold mt-1">Review alerts and system updates.</p>
              </div>

              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 divide-y divide-slate-100">
                {notifications.map((notif) => (
                  <div key={notif.id} className="py-3 first:pt-0">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                        {!notif.read && <span className="h-2 w-2 bg-accent rounded-full shrink-0" />}
                        {notif.title}
                      </h4>
                      <span className="text-[9px] text-slate-400 font-semibold">
                        {new Date(notif.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-slate-500 text-xs mt-1.5 leading-relaxed font-semibold">{notif.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export const ProfilePage = () => {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-24 min-h-[85vh] flex flex-col items-center justify-center gap-4 text-slate-450">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" />
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Loading user profile...</span>
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
};

export default ProfilePage;

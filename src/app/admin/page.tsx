'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { useHydrated } from '@/hooks/useHydrated';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Plus, 
  Trash2, 
  TrendingUp, 
  Users, 
  Package, 
  Tag, 
  Truck, 
  Check, 
  Edit3, 
  Star,
  Loader2,
  AlertTriangle,
  ArrowUpDown,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';

export const AdminDashboard = () => {
  const router = useRouter();
  const isHydrated = useHydrated();

  // Zustand State
  const user = useStore((state) => state.user);
  const orders = useStore((state) => state.orders);
  const adminProducts = useStore((state) => state.adminProducts);
  const addAdminProduct = useStore((state) => state.addAdminProduct);
  const updateAdminProduct = useStore((state) => state.updateAdminProduct);
  const deleteAdminProduct = useStore((state) => state.deleteAdminProduct);
  const updateOrderStatus = useStore((state) => state.updateOrderStatus);

  // active sub-section tab
  const [activeTab, setActiveTab] = useState<string>('analytics');

  // Form states for adding a new product
  const [newProdName, setNewProdName] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdPrice, setNewProdPrice] = useState(1.99);
  const [newProdDiscount, setNewProdDiscount] = useState(0);
  const [newProdUnit, setNewProdUnit] = useState('1 kg');
  const [newProdStock, setNewProdStock] = useState(25);
  const [newProdCatId, setNewProdCatId] = useState('cat-1'); // Fruits
  const [newProdNutrition, setNewProdNutrition] = useState('Energy: 40 kcal, Protein: 1g');
  const [newProdImage, setNewProdImage] = useState('https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=500&auto=format&fit=crop&q=80');

  // Coupon Form State
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(10);
  const [couponMin, setCouponMin] = useState(15);
  const [couponDesc, setCouponDesc] = useState('');

  // Authorization Check
  useEffect(() => {
    if (isHydrated) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'ADMIN') {
        router.push('/profile'); // Redirect regular users
      }
    }
  }, [isHydrated, user]);

  if (!isHydrated || !user || user.role !== 'ADMIN') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center text-slate-400">
        <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
      </div>
    );
  }

  // Calculate Key Metrics
  const totalRevenue = orders
    .filter(o => o.paymentStatus === 'PAID')
    .reduce((sum, o) => sum + o.total, 0);

  const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
  const lowStockCount = adminProducts.filter(p => p.stock < 20).length;

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProdName && newProdDesc && newProdPrice) {
      addAdminProduct({
        name: newProdName,
        slug: newProdName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: newProdDesc,
        price: newProdPrice,
        discount: newProdDiscount,
        image: newProdImage,
        images: [newProdImage],
        unit: newProdUnit,
        stock: newProdStock,
        nutrition: newProdNutrition,
        rating: 5.0,
        isFeatured: false,
        categoryId: newProdCatId
      });
      // reset
      setNewProdName('');
      setNewProdDesc('');
      setNewProdPrice(1.99);
      setNewProdDiscount(0);
      setNewProdUnit('1 kg');
      setNewProdStock(25);
    }
  };

  const handleUpdateStock = (productId: string, newStock: number) => {
    updateAdminProduct(productId, { stock: Math.max(0, newStock) });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 min-h-[85vh] font-sans text-slate-800">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 pb-6 border-b border-slate-150">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-slate-850">Admin Control Center</h1>
          <p className="text-xs text-slate-450 font-semibold mt-1">Manage store inventory, client orders, and sales reports.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-650 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full shadow-sm">
          <Truck className="h-4 w-4 text-primary" />
          <span>Pure O Fresh Manager Mode</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* SIDE MENU BAR */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-100 p-4 shadow-sm flex flex-col gap-1 text-xs font-semibold text-slate-650">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl transition ${
                activeTab === 'analytics' ? 'bg-primary text-white' : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" /> Analytics Overview
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition ${
                activeTab === 'orders' ? 'bg-primary text-white' : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              <span className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" /> Order Requests
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'orders' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {orders.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl transition ${
                activeTab === 'products' ? 'bg-primary text-white' : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              <Package className="h-4 w-4" /> Product Catalog
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition ${
                activeTab === 'inventory' ? 'bg-primary text-white' : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              <span className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4" /> Stock Control
              </span>
              {lowStockCount > 0 && (
                <span className="bg-rose-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                  {lowStockCount} LOW
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('coupons')}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl transition ${
                activeTab === 'coupons' ? 'bg-primary text-white' : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              <Tag className="h-4 w-4" /> Promo Coupons
            </button>
          </div>
        </div>

        {/* WORK AREA VIEW */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* TAB 1: Analytics Dashboard */}
          {activeTab === 'analytics' && (
            <div className="space-y-8">
              
              {/* Card Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Metric 1 */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Paid Revenue</span>
                  <p className="text-xl font-extrabold text-slate-800">₹{Math.round(totalRevenue).toLocaleString('en-IN')}</p>
                  <span className="text-[9px] text-emerald-600 font-extrabold flex items-center gap-0.5 leading-none">
                    <TrendingUp className="h-3 w-3" /> +12.5% this week
                  </span>
                </div>
                
                {/* Metric 2 */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Total Orders</span>
                  <p className="text-xl font-extrabold text-slate-800">{orders.length}</p>
                  <span className="text-[9px] text-emerald-600 font-extrabold flex items-center gap-0.5 leading-none">
                    <TrendingUp className="h-3 w-3" /> +8.2% from last month
                  </span>
                </div>

                {/* Metric 3 */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Average Value</span>
                  <p className="text-xl font-extrabold text-slate-800">₹{Math.round(averageOrderValue).toLocaleString('en-IN')}</p>
                  <span className="text-[9px] text-slate-400 font-semibold leading-none">
                    Order value stability index
                  </span>
                </div>

                {/* Metric 4 */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Low Stock Alerts</span>
                  <p className="text-xl font-extrabold text-rose-600">{lowStockCount}</p>
                  {lowStockCount > 0 ? (
                    <span className="text-[9px] text-rose-500 font-extrabold flex items-center gap-0.5 leading-none">
                      <AlertTriangle className="h-3 w-3 animate-pulse" /> Action required
                    </span>
                  ) : (
                    <span className="text-[9px] text-green-600 font-semibold leading-none">
                      All inventory full
                    </span>
                  )}
                </div>
              </div>

              {/* Graphic Charts (SVG Representation) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Revenue line chart mockup */}
                <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Weekly Revenue Trend</h3>
                  
                  <div className="h-44 bg-slate-50 rounded-2xl border border-slate-100 p-4 relative flex items-end">
                    {/* SVG Graphic mockup */}
                    <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                      {/* Path line */}
                      <path
                        d="M0,80 Q50,40 100,60 T200,30 T300,10"
                        fill="none"
                        stroke="#00A651"
                        strokeWidth="3"
                      />
                      {/* Grid guidelines */}
                      <line x1="0" y1="50" x2="300" y2="50" stroke="#E2E8F0" strokeDasharray="3,3" />
                      <line x1="0" y1="20" x2="300" y2="20" stroke="#E2E8F0" strokeDasharray="3,3" />
                    </svg>

                    <div className="absolute inset-x-4 bottom-2 flex justify-between text-[8px] font-bold text-slate-400">
                      <span>Mon</span>
                      <span>Wed</span>
                      <span>Fri</span>
                      <span>Sun</span>
                    </div>
                  </div>
                </div>

                {/* Categories share chart mockup */}
                <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Category Sales Share</h3>
                  
                  <div className="h-44 bg-slate-50 rounded-2xl border border-slate-100 p-4 flex items-center justify-center gap-6">
                    {/* Ring circular mockup chart */}
                    <div className="h-28 w-28 rounded-full border-8 border-primary relative flex items-center justify-center">
                      {/* overlay part color */}
                      <div className="absolute inset-0 rounded-full border-8 border-transparent border-t-secondary border-r-secondary transform rotate-45 pointer-events-none" />
                      <div className="text-center font-bold text-xs">
                        <span className="text-slate-450 block text-[9px]">Fruits</span>
                        45%
                      </div>
                    </div>

                    <div className="text-[9px] font-bold space-y-1.5 text-slate-650">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-primary" /> Fruits (45%)
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-secondary" /> Vegetables (35%)
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-slate-350" /> Other (20%)
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: Orders Manager */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6">
              <div>
                <h2 className="font-display text-xl font-extrabold text-slate-850">Client Orders manager</h2>
                <p className="text-xs text-slate-450 font-semibold mt-1">Review active delivery timeline progressions.</p>
              </div>

              {orders.length > 0 ? (
                <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                  <table className="w-full text-left border-collapse text-xs font-semibold text-slate-650">
                    <thead className="bg-slate-50 border-b border-slate-200 uppercase text-[9px] font-bold text-slate-400">
                      <tr>
                        <th className="p-4">Order ID</th>
                        <th className="p-4">Date</th>
                        <th className="p-4">Total</th>
                        <th className="p-4">Payment</th>
                        <th className="p-4">Status Update</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {orders.map((o) => (
                        <tr key={o.id} className="hover:bg-slate-50/50 transition">
                          <td className="p-4 font-bold text-slate-800">{o.id}</td>
                          <td className="p-4 text-slate-500">
                            {new Date(o.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </td>
                          <td className="p-4 font-bold text-primary">₹{Math.round(o.total).toLocaleString('en-IN')}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              o.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {o.paymentStatus}
                            </span>
                          </td>
                          <td className="p-4">
                            <select
                              value={o.status}
                              onChange={(e) => updateOrderStatus(o.id, e.target.value as any)}
                              className="bg-white border border-slate-200 rounded px-2 py-1 focus:outline-none focus:border-primary text-slate-700 text-xs"
                            >
                              <option value="PLACED">Placed</option>
                              <option value="PROCESSING">Processing</option>
                              <option value="PACKING">Packing</option>
                              <option value="SHIPPED">Shipped</option>
                              <option value="DELIVERED">Delivered</option>
                              <option value="CANCELLED">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 font-medium">No order placements registered yet.</div>
              )}
            </div>
          )}

          {/* TAB 3: Products Catalog Manager */}
          {activeTab === 'products' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              
              {/* Product creator form */}
              <div className="xl:col-span-1 bg-white rounded-3xl border border-slate-100 p-5 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 text-sm pb-3 border-b border-slate-150">Create New Product</h3>
                
                <form onSubmit={handleCreateProduct} className="space-y-3.5 text-xs font-semibold">
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 block mb-1">Product Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Organic Watermelon"
                      value={newProdName}
                      onChange={(e) => setNewProdName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:border-primary text-slate-850"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-slate-400 block mb-1">Description</label>
                    <textarea
                      placeholder="Product details, origin..."
                      value={newProdDesc}
                      onChange={(e) => setNewProdDesc(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:border-primary text-slate-850"
                      rows={2}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 block mb-1">Price (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={newProdPrice}
                        onChange={(e) => setNewProdPrice(parseFloat(e.target.value))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:border-primary text-slate-850"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 block mb-1">Discount (%)</label>
                      <input
                        type="number"
                        value={newProdDiscount}
                        onChange={(e) => setNewProdDiscount(parseInt(e.target.value))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:border-primary text-slate-850"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 block mb-1">Package Unit</label>
                      <input
                        type="text"
                        value={newProdUnit}
                        onChange={(e) => setNewProdUnit(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:border-primary text-slate-850"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 block mb-1">Initial Stock</label>
                      <input
                        type="number"
                        value={newProdStock}
                        onChange={(e) => setNewProdStock(parseInt(e.target.value))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:border-primary text-slate-850"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white rounded-full text-xs font-bold transition shadow"
                  >
                    Add Product
                  </button>
                </form>
              </div>

              {/* Products list overview */}
              <div className="xl:col-span-2 bg-white rounded-3xl border border-slate-100 p-5 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 text-sm pb-3 border-b border-slate-150">Active Catalog ({adminProducts.length} items)</h3>
                
                <div className="max-h-[380px] overflow-y-auto pr-1 divide-y divide-slate-100">
                  {adminProducts.map((p) => (
                    <div key={p.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-xs font-semibold">
                      <div className="flex items-center gap-2 min-w-0">
                        <img src={p.image} alt={p.name} className="h-10 w-10 rounded-lg object-cover border border-slate-150 shrink-0" />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 truncate">{p.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold">₹{Math.round(p.price)} / {p.unit}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          p.stock < 20 ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          Stock: {p.stock}
                        </span>
                        
                        <button
                          onClick={() => deleteAdminProduct(p.id)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-full transition"
                          aria-label="Delete product"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: Stock Control Control */}
          {activeTab === 'inventory' && (
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6">
              <div>
                <h2 className="font-display text-xl font-extrabold text-slate-850">Stock Level Tracker</h2>
                <p className="text-xs text-slate-450 font-semibold mt-1">Adjust and replenish grocery stock instantly.</p>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left border-collapse text-xs font-semibold text-slate-655">
                  <thead className="bg-slate-50 border-b border-slate-200 uppercase text-[9px] font-bold text-slate-400">
                    <tr>
                      <th className="p-4">Product</th>
                      <th className="p-4">Department</th>
                      <th className="p-4 text-center">Stock Level</th>
                      <th className="p-4 text-center">Adjust Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {adminProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition">
                        <td className="p-4 font-bold text-slate-800">{p.name}</td>
                        <td className="p-4 text-slate-400 font-bold uppercase">{p.categoryId}</td>
                        <td className="p-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                            p.stock < 20 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {p.stock} units
                          </span>
                        </td>
                        <td className="p-4 flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleUpdateStock(p.id, p.stock - 5)}
                            className="h-7 w-7 rounded-lg border border-slate-200 hover:bg-slate-100 font-extrabold text-slate-750"
                          >
                            -5
                          </button>
                          <button
                            onClick={() => handleUpdateStock(p.id, p.stock + 10)}
                            className="px-2 py-1 rounded-lg border border-primary hover:bg-primary/5 text-primary font-bold"
                          >
                            +10
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: Promo Coupon Creator */}
          {activeTab === 'coupons' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Form */}
              <div className="md:col-span-1 bg-white rounded-3xl border border-slate-100 p-5 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 text-sm pb-3 border-b border-slate-150">Create Coupon Code</h3>
                
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (couponCode && couponDesc) {
                      useStore.setState((state) => ({
                        // Push into simulated database trigger notifications
                        notifications: [
                          {
                            id: 'notif-' + Math.random().toString(36).substr(2,9),
                            title: 'New Coupon Available!',
                            message: `Use code ${couponCode.toUpperCase()} for savings!`,
                            timestamp: new Date().toISOString(),
                            read: false
                          },
                          ...state.notifications
                        ]
                      }));
                      alert(`Coupon code ${couponCode.toUpperCase()} registered locally!`);
                      setCouponCode('');
                      setCouponDesc('');
                    }
                  }} 
                  className="space-y-3.5 text-xs font-semibold"
                >
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 block mb-1">Coupon Code</label>
                    <input
                      type="text"
                      placeholder="e.g. EXTRA5"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:border-primary text-slate-850 uppercase"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 block mb-1">Description</label>
                    <input
                      type="text"
                      placeholder="e.g. ₹100 Off on orders above ₹999"
                      value={couponDesc}
                      onChange={(e) => setCouponDesc(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:border-primary text-slate-850"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white rounded-full text-xs font-bold transition shadow"
                  >
                    Register Coupon
                  </button>
                </form>
              </div>

              {/* Coupon Suggestions list */}
              <div className="md:col-span-2 bg-white rounded-3xl border border-slate-100 p-5 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 text-sm pb-3 border-b border-slate-150">Active Promo list</h3>
                <p className="text-[10px] text-slate-450 font-semibold leading-relaxed">Refer to the Offers page to review the complete coupon parameters.</p>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;

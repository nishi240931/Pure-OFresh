'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  Loader2, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { useHydrated } from '@/hooks/useHydrated';
import ProductForm from '@/components/ProductForm';

interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  image: string;
  price: number;
  discountPrice: number | null;
  weight: number;
  unit: string;
  stock: number;
  rating: number;
  isOrganic: boolean;
  isFeatured: boolean;
  categoryId: string;
  category: {
    name: string;
  };
  createdAt: string;
}

export default function AdminProductsPage() {
  const isHydrated = useHydrated();

  // State Management
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters / Sorting / Pagination States
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('all');
  const [stockStatus, setStockStatus] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const limit = 8;

  // Modals & Operations
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Notifications
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const triggerToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const qParams = new URLSearchParams();
      if (search) qParams.append('search', search);
      if (categoryId && categoryId !== 'all') qParams.append('categoryId', categoryId);
      if (stockStatus && stockStatus !== 'all') qParams.append('stockStatus', stockStatus);
      qParams.append('sortBy', sortBy);
      qParams.append('sortOrder', sortOrder);
      qParams.append('page', page.toString());
      qParams.append('limit', limit.toString());

      const res = await fetch(`/api/admin/products?${qParams.toString()}`);
      const data = await res.json();
      if (data.success && data.data) {
        setProducts(data.data.products);
        setTotal(data.data.total);
      } else {
        setError(data.message || 'Failed to fetch catalog.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error fetching products.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories for filters & form
  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success && (data.categories || data.data)) {
        setCategories(data.categories || data.data || []);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  useEffect(() => {
    if (isHydrated) {
      fetchProducts();
    }
  }, [isHydrated, search, categoryId, stockStatus, sortBy, sortOrder, page]);

  useEffect(() => {
    if (isHydrated) {
      fetchCategories();
    }
  }, [isHydrated]);

  if (!isHydrated) {
    return null;
  }

  // Toggle boolean fields (featured / organic)
  const handleToggle = async (id: string, field: 'featured' | 'organic', currentValue: boolean) => {
    setActionLoadingId(`${id}-${field}`);
    try {
      const res = await fetch(`/api/admin/products/${id}/${field}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: !currentValue }),
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, [field === 'featured' ? 'isFeatured' : 'isOrganic']: !currentValue } : p))
        );
        triggerToast('success', `${field.charAt(0).toUpperCase() + field.slice(1)} status updated successfully.`);
      } else {
        triggerToast('error', data.message || 'Update failed.');
      }
    } catch (err: any) {
      triggerToast('error', err.message || 'Network error.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Quick stock edit
  const handleStockChange = async (id: string, newStock: number) => {
    if (newStock < 0) return;
    setActionLoadingId(`${id}-stock`);
    try {
      const res = await fetch(`/api/admin/products/${id}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock }),
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, stock: newStock } : p)));
        triggerToast('success', 'Stock quantity adjusted.');
      } else {
        triggerToast('error', data.message || 'Stock adjustment failed.');
      }
    } catch (err: any) {
      triggerToast('error', err.message || 'Network error.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete product
  const handleDelete = async (id: string) => {
    setActionLoadingId(`${id}-delete`);
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setDeleteConfirmId(null);
        triggerToast('success', 'Product deleted successfully.');
        fetchProducts(); // Refresh layout
      } else {
        triggerToast('error', data.message || 'Failed to delete product.');
      }
    } catch (err: any) {
      triggerToast('error', err.message || 'Delete operation failed.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  // Get stock status badges
  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return <span className="bg-rose-50 border border-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Out of Stock</span>;
    }
    if (stock < 20) {
      return <span className="bg-amber-50 border border-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Low Stock ({stock})</span>;
    }
    return <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">In Stock ({stock})</span>;
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-xl flex items-center gap-2 border text-xs font-bold animate-fade-in ${
          toast.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'
        }`}>
          <CheckCircle className="h-4.5 w-4.5" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold font-display text-slate-800 tracking-tight">Products Management</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">Add, edit, remove, and adjust inventory thresholds for catalog items</p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setIsFormOpen(true);
          }}
          className="self-start sm:self-center flex items-center gap-1.5 px-5 py-2.5 bg-[#FF6B00] hover:bg-accent text-white text-xs font-bold rounded-full shadow-md transition"
        >
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      {/* FILTER & SEARCH ROW */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search Input */}
        <div className="relative w-full md:max-w-xs shrink-0">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input 
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search products by SKU or Name..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs font-semibold"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:justify-end">
          
          {/* Category Filter */}
          <select
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold bg-white focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Stock Filter */}
          <select
            value={stockStatus}
            onChange={(e) => {
              setStockStatus(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold bg-white focus:outline-none"
          >
            <option value="all">All Stock Levels</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock (Under 20)</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>

          <button 
            onClick={fetchProducts}
            className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition text-slate-600"
            title="Refresh List"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

        </div>

      </div>

      {/* PRODUCTS TABLE CONTAINER */}
      <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
        
        {loading && products.length === 0 ? (
          /* SKELETON TABLE */
          <div className="p-8 space-y-4">
            <div className="h-6 bg-slate-100 rounded w-1/4 animate-pulse" />
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-14 bg-slate-50 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        ) : error ? (
          /* ERROR CARD */
          <div className="p-8 text-center text-slate-500 space-y-3">
            <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto" />
            <p className="text-xs font-bold text-slate-700">Catalog Loading Failed</p>
            <p className="text-[10px] text-slate-400 max-w-sm mx-auto">{error}</p>
            <button onClick={fetchProducts} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-750 text-xs font-bold rounded-xl transition">
              Retry Load
            </button>
          </div>
        ) : products.length === 0 ? (
          /* EMPTY STATE */
          <div className="p-16 text-center text-slate-450 space-y-4">
            <div className="h-14 w-14 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <HelpCircle className="h-6 w-6 text-slate-400" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-700">No Products Found</p>
              <p className="text-[10px] text-slate-400 max-w-xs mx-auto leading-relaxed">
                We couldn't find any products matching your search terms or filters. Try adjusting them.
              </p>
            </div>
          </div>
        ) : (
          /* ACTUAL DATA TABLE */
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs font-semibold text-slate-700">
              
              <thead className="bg-slate-50/80 border-b border-slate-150 text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none">
                <tr>
                  <th className="py-4 px-6">Image</th>
                  <th className="py-4 px-4 cursor-pointer hover:bg-slate-100 transition" onClick={() => handleSort('name')}>
                    Product Details {sortBy === 'name' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th className="py-4 px-4">Category</th>
                  <th className="py-4 px-4 cursor-pointer hover:bg-slate-100 transition" onClick={() => handleSort('price')}>
                    Price {sortBy === 'price' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th className="py-4 px-4 cursor-pointer hover:bg-slate-100 transition" onClick={() => handleSort('stock')}>
                    Stock & Inventory {sortBy === 'stock' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th className="py-4 px-4">Tags</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {products.map((p) => {
                  const isFeaturedLoading = actionLoadingId === `${p.id}-featured`;
                  const isOrganicLoading = actionLoadingId === `${p.id}-organic`;
                  const isDeleteLoading = actionLoadingId === `${p.id}-delete`;
                  const isStockLoading = actionLoadingId === `${p.id}-stock`;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/40 transition">
                      
                      {/* IMAGE */}
                      <td className="py-4.5 px-6 shrink-0">
                        <div className="h-12 w-12 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center">
                          <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                        </div>
                      </td>

                      {/* NAME / SKU */}
                      <td className="py-4.5 px-4 max-w-[200px]">
                        <p className="font-bold text-slate-800 truncate" title={p.name}>{p.name}</p>
                        <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">{p.sku}</p>
                        <p className="text-[9px] font-bold text-amber-600 mt-0.5">⭐ {p.rating.toFixed(1)} rating</p>
                      </td>

                      {/* CATEGORY */}
                      <td className="py-4.5 px-4 font-bold text-slate-500">
                        {p.category?.name || 'Unassigned'}
                      </td>

                      {/* PRICE */}
                      <td className="py-4.5 px-4">
                        {p.discountPrice ? (
                          <div>
                            <span className="font-extrabold text-slate-800">₹{p.discountPrice}</span>
                            <span className="text-[10px] text-slate-400 line-through font-bold ml-1.5">₹{p.price}</span>
                          </div>
                        ) : (
                          <span className="font-extrabold text-slate-800">₹{p.price}</span>
                        )}
                        <p className="text-[9px] text-slate-400 font-semibold mt-0.5">{p.weight} {p.unit}</p>
                      </td>

                      {/* STOCK INVENTORY QUICK ADJUST */}
                      <td className="py-4.5 px-4">
                        <div className="space-y-1.5">
                          {getStockBadge(p.stock)}
                          <div className="flex items-center gap-1">
                            <input 
                              type="number"
                              defaultValue={p.stock}
                              disabled={isStockLoading}
                              onBlur={(e) => {
                                const val = parseInt(e.target.value, 10);
                                if (!isNaN(val) && val !== p.stock) {
                                  handleStockChange(p.id, val);
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  const val = parseInt((e.target as HTMLInputElement).value, 10);
                                  if (!isNaN(val) && val !== p.stock) {
                                    handleStockChange(p.id, val);
                                  }
                                }
                              }}
                              className="w-16 px-1.5 py-0.5 rounded border border-slate-200 text-center text-[10px] font-extrabold focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                            />
                            {isStockLoading && <Loader2 className="h-3 w-3 animate-spin text-emerald-500" />}
                          </div>
                        </div>
                      </td>

                      {/* BADGE TOGGLES */}
                      <td className="py-4.5 px-4 space-y-1">
                        <button
                          onClick={() => handleToggle(p.id, 'organic', p.isOrganic)}
                          disabled={isOrganicLoading}
                          className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border transition ${
                            p.isOrganic 
                              ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                              : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300'
                          }`}
                        >
                          {isOrganicLoading ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <Sparkles className="h-2.5 w-2.5" />}
                          Organic
                        </button>
                        <button
                          onClick={() => handleToggle(p.id, 'featured', p.isFeatured)}
                          disabled={isFeaturedLoading}
                          className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border transition ${
                            p.isFeatured 
                              ? 'bg-amber-50 border-amber-100 text-amber-700' 
                              : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300'
                          }`}
                        >
                          {isFeaturedLoading ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <TrendingUp className="h-2.5 w-2.5" />}
                          Featured
                        </button>
                      </td>

                      {/* ACTIONS */}
                      <td className="py-4.5 px-6 text-right">
                        {deleteConfirmId === p.id ? (
                          <div className="flex justify-end gap-1.5 items-center">
                            <span className="text-[9px] text-rose-600 font-bold mr-1">Confirm delete?</span>
                            <button
                              onClick={() => handleDelete(p.id)}
                              disabled={isDeleteLoading}
                              className="px-2 py-1 bg-rose-600 text-white rounded-md text-[9px] font-bold hover:bg-rose-700 transition"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2 py-1 bg-slate-100 text-slate-650 rounded-md text-[9px] font-bold hover:bg-slate-200 transition"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingProduct(p);
                                setIsFormOpen(true);
                              }}
                              className="p-1.5 border border-slate-250 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition"
                              title="Edit Product"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(p.id)}
                              className="p-1.5 border border-rose-100 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition"
                              title="Delete Product"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </td>

                    </tr>
                  );
                })}
              </tbody>

            </table>
          </div>
        )}

        {/* PAGINATION BOTTOM FOOTER */}
        {totalPages > 1 && (
          <div className="h-16 px-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Showing Page {page} of {totalPages} ({total} products)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="p-1.5 border border-slate-200 rounded-xl hover:bg-slate-150 transition disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="p-1.5 border border-slate-200 rounded-xl hover:bg-slate-150 transition disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* FORM MODAL */}
      {isFormOpen && (
        <ProductForm 
          product={editingProduct}
          categories={categories}
          onClose={() => setIsFormOpen(false)}
          onSuccess={() => {
            setIsFormOpen(false);
            fetchProducts(); // Refresh list
            triggerToast('success', editingProduct ? 'Product details updated.' : 'New product created.');
          }}
        />
      )}

    </div>
  );
}

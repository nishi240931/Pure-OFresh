'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Tag, 
  AlertTriangle, 
  Loader2, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { useHydrated } from '@/hooks/useHydrated';
import CategoryForm from '@/components/CategoryForm';

interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string | null;
  isActive: boolean;
  displayOrder: number;
  productCount: number;
  createdAt: string;
}

export default function AdminCategoriesPage() {
  const isHydrated = useHydrated();

  // State Management
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters / Sorting / Pagination States
  const [search, setSearch] = useState('');
  const [isActiveStatus, setIsActiveStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState('displayOrder');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const limit = 8;

  // Modals & Operations
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteConfirmCategory, setDeleteConfirmCategory] = useState<Category | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Notifications
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const triggerToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch categories
  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const qParams = new URLSearchParams();
      if (search) qParams.append('search', search);
      if (isActiveStatus && isActiveStatus !== 'all') qParams.append('isActiveStatus', isActiveStatus);
      qParams.append('sortBy', sortBy);
      qParams.append('sortOrder', sortOrder);
      qParams.append('page', page.toString());
      qParams.append('limit', limit.toString());

      const res = await fetch(`/api/admin/categories?${qParams.toString()}`);
      const json = await res.json();
      if (json.success && json.data) {
        setCategories(json.data.categories);
        setTotal(json.data.total);
      } else {
        setError(json.message || 'Failed to fetch categories.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error fetching categories.');
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch on changes
  useEffect(() => {
    if (isHydrated) {
      fetchCategories();
    }
  }, [isHydrated, search, isActiveStatus, sortBy, sortOrder, page]);

  // Toggle active status
  const handleToggleStatus = async (id: string) => {
    setActionLoadingId(id);
    try {
      const res = await fetch(`/api/admin/categories/${id}/toggle`, {
        method: 'PATCH',
      });
      const json = await res.json();
      if (json.success) {
        triggerToast('success', 'Category status updated successfully.');
        fetchCategories();
      } else {
        triggerToast('error', json.message || 'Failed to toggle status.');
      }
    } catch (err: any) {
      triggerToast('error', err.message || 'Failed to update category status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete category
  const handleDeleteCategory = async () => {
    if (!deleteConfirmCategory) return;
    const { id, name, productCount } = deleteConfirmCategory;

    if (productCount > 0) {
      triggerToast('error', `Cannot delete "${name}": Category contains linked products.`);
      setDeleteConfirmCategory(null);
      return;
    }

    setActionLoadingId(id);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        triggerToast('success', 'Category deleted successfully.');
        setDeleteConfirmCategory(null);
        fetchCategories();
      } else {
        triggerToast('error', json.message || 'Failed to delete category.');
      }
    } catch (err: any) {
      triggerToast('error', err.message || 'Failed to delete category.');
    } finally {
      setActionLoadingId(null);
    }
  };

  if (!isHydrated) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed bottom-4 right-4 z-50 p-4 rounded-2xl border shadow-lg flex items-center gap-3 transition-all duration-300 ${
          toast.type === 'success' 
            ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
            : 'bg-rose-50 border-rose-100 text-rose-700'
        }`}>
          <CheckCircle className="h-5 w-5 shrink-0" />
          <p className="text-xs font-bold">{toast.message}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold font-display text-slate-800 tracking-tight">Categories Management</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">Define and organize your e-commerce product taxonomy</p>
        </div>
        <button
          onClick={() => {
            setEditingCategory(null);
            setIsFormOpen(true);
          }}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-750 text-white text-xs font-bold px-4 py-2.5 rounded-2xl transition-colors shadow-sm self-start md:self-auto"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </button>
      </div>

      {/* Filter / Sort Panel */}
      <div className="bg-white rounded-3xl border border-slate-200/60 p-4 md:p-6 grid grid-cols-1 md:grid-cols-4 gap-4 shadow-sm">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name or slug..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200/70 rounded-2xl pl-10 pr-4 py-3 placeholder:text-slate-450 focus:outline-none focus:border-slate-350 focus:bg-white transition-colors"
          />
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
        </div>

        {/* Filter Status */}
        <div>
          <select
            value={isActiveStatus}
            onChange={(e) => {
              setIsActiveStatus(e.target.value as any);
              setPage(1);
            }}
            className="w-full text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200/70 rounded-2xl px-4 py-3 focus:outline-none focus:border-slate-350 focus:bg-white transition-colors cursor-pointer appearance-none"
          >
            <option value="all">All Visibility (Status)</option>
            <option value="active">Active only</option>
            <option value="inactive">Inactive only</option>
          </select>
        </div>

        {/* Sort By */}
        <div>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
            className="w-full text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200/70 rounded-2xl px-4 py-3 focus:outline-none focus:border-slate-350 focus:bg-white transition-colors cursor-pointer appearance-none"
          >
            <option value="displayOrder">Sort by: Display Order</option>
            <option value="name">Sort by: Alphabetical Name</option>
            <option value="createdAt">Sort by: Date Created</option>
            <option value="productCount">Sort by: Product Count</option>
          </select>
        </div>

        {/* Sort Order */}
        <div>
          <select
            value={sortOrder}
            onChange={(e) => {
              setSortOrder(e.target.value as any);
              setPage(1);
            }}
            className="w-full text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200/70 rounded-2xl px-4 py-3 focus:outline-none focus:border-slate-350 focus:bg-white transition-colors cursor-pointer appearance-none"
          >
            <option value="asc">Order: Low to High / Ascending</option>
            <option value="desc">Order: High to Low / Descending</option>
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-200/60 p-24 text-center shadow-sm">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mx-auto" />
          <p className="text-xs font-semibold text-slate-400 mt-3">Loading product categories...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-3xl border border-slate-200/60 p-12 text-center shadow-sm max-w-md mx-auto space-y-4">
          <AlertTriangle className="h-10 w-10 text-rose-500 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">Fetch Failed</h3>
          <p className="text-xs text-slate-500 leading-relaxed">{error}</p>
          <button
            onClick={fetchCategories}
            className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/60 p-16 text-center shadow-sm max-w-lg mx-auto space-y-4">
          <div className="h-12 w-12 bg-slate-50 border border-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <Tag className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-700">No Categories Found</p>
            <p className="text-[10px] text-slate-450 font-semibold leading-relaxed max-w-xs mx-auto">
              We couldn't find any categories matching your filters. Add a new category to get started.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/60 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200/60 text-slate-450 text-[10px] font-bold tracking-wider uppercase">
                  <th className="py-4 px-6">Image</th>
                  <th className="py-4 px-6">Category Details</th>
                  <th className="py-4 px-6">Slug</th>
                  <th className="py-4 px-6 text-center">Display Order</th>
                  <th className="py-4 px-6 text-center">Product Count</th>
                  <th className="py-4 px-6 text-center">Visibility</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-650">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Image */}
                    <td className="py-4 px-6">
                      <div className="h-10 w-10 rounded-xl border border-slate-200/75 overflow-hidden bg-white shrink-0">
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as any).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500';
                          }}
                        />
                      </div>
                    </td>

                    {/* Category Details */}
                    <td className="py-4 px-6 max-w-xs">
                      <div>
                        <p className="font-extrabold text-slate-800 text-sm tracking-tight">{cat.name}</p>
                        {cat.description && (
                          <p className="text-[10px] text-slate-455 line-clamp-1 mt-0.5 font-semibold">
                            {cat.description}
                          </p>
                        )}
                        <p className="text-[9px] text-slate-400 font-medium mt-1">
                          Created {new Date(cat.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </td>

                    {/* Slug */}
                    <td className="py-4 px-6 font-mono text-[10px] text-slate-500">
                      /{cat.slug}
                    </td>

                    {/* Display Order */}
                    <td className="py-4 px-6 text-center font-bold text-slate-700">
                      {cat.displayOrder}
                    </td>

                    {/* Product Count */}
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center justify-center font-bold h-6 min-w-6 px-1.5 rounded-full text-[10px] ${
                        cat.productCount > 0 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                          : 'bg-slate-50 text-slate-400 border border-slate-100'
                      }`}>
                        {cat.productCount}
                      </span>
                    </td>

                    {/* Visibility status toggle */}
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleToggleStatus(cat.id)}
                        disabled={actionLoadingId === cat.id}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                          cat.isActive 
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-700 hover:bg-emerald-100/50' 
                            : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'
                        }`}
                      >
                        {actionLoadingId === cat.id ? (
                          <Loader2 className="h-3 w-3 animate-spin text-slate-400" />
                        ) : (
                          cat.isActive ? 'Active' : 'Inactive'
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => {
                            setEditingCategory(cat);
                            setIsFormOpen(true);
                          }}
                          className="h-8 w-8 flex items-center justify-center text-slate-450 hover:text-slate-700 border border-slate-200 hover:border-slate-300 bg-white rounded-xl shadow-sm transition-all"
                          title="Edit Category"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmCategory(cat)}
                          className="h-8 w-8 flex items-center justify-center text-rose-500 hover:text-rose-600 border border-slate-200 hover:border-rose-100 bg-white hover:bg-rose-50/30 rounded-xl shadow-sm transition-all"
                          title="Delete Category"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination controls */}
          <div className="bg-slate-50/50 border-t border-slate-200/60 p-4 flex items-center justify-between text-xs font-semibold text-slate-500">
            <p>Showing {categories.length} of {total} categories</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-8 w-8 flex items-center justify-center bg-white border border-slate-200 rounded-xl hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-white shadow-sm transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="h-8 w-8 flex items-center justify-center bg-white border border-slate-200 rounded-xl hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-white shadow-sm transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Creation / Edit Modal */}
      {isFormOpen && (
        <CategoryForm
          category={editingCategory}
          onClose={() => setIsFormOpen(false)}
          onSuccess={() => {
            triggerToast('success', editingCategory ? 'Category updated successfully.' : 'Category created successfully.');
            fetchCategories();
          }}
        />
      )}

      {/* Deletion Confirm Modal */}
      {deleteConfirmCategory && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] border border-slate-200/60 shadow-xl max-w-sm w-full p-6 text-center space-y-4">
            <div className="h-12 w-12 bg-rose-50 border border-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <AlertTriangle className="h-5 w-5" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-extrabold font-display text-slate-800 tracking-tight">Confirm Deletion</h3>
              <p className="text-xs text-slate-450 font-semibold px-4">
                Are you sure you want to delete <span className="font-bold text-slate-700">"{deleteConfirmCategory.name}"</span>?
              </p>
            </div>

            {deleteConfirmCategory.productCount > 0 ? (
              <div className="p-3 bg-amber-50 border border-amber-100 text-amber-800 rounded-2xl text-[10px] font-bold text-left leading-relaxed">
                ⚠️ Warning: This category currently has <span className="underline">{deleteConfirmCategory.productCount} linked products</span>. Deletion is blocked to protect catalog integrity. You must first re-assign or delete those products.
              </div>
            ) : (
              <p className="text-[10px] text-slate-400 font-medium">This category is empty and can be deleted safely.</p>
            )}

            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={() => setDeleteConfirmCategory(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-650 text-xs font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCategory}
                disabled={deleteConfirmCategory.productCount > 0 || actionLoadingId !== null}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold rounded-xl transition-colors inline-flex items-center justify-center gap-1.5"
              >
                {actionLoadingId === deleteConfirmCategory.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

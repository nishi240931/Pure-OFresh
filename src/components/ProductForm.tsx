'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { adminProductSchema } from '@/validators/adminProductValidator';
import { X, Upload, Loader2, AlertCircle } from 'lucide-react';

interface ProductFormProps {
  product?: any; // If editing, pass current product
  categories: Array<{ id: string; name: string }>;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProductForm({ product, categories, onClose, onSuccess }: ProductFormProps) {
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(product?.image || null);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(adminProductSchema),
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      price: product?.price || 1.99,
      discountPrice: product?.discountPrice || null,
      weight: product?.weight || 1.0,
      unit: product?.unit || 'kg',
      stock: product?.stock || 10,
      isOrganic: product?.isOrganic || false,
      isFeatured: product?.isFeatured || false,
      image: product?.image || '',
      categoryId: product?.categoryId || (categories[0]?.id || ''),
    },
  });

  const watchImage = watch('image');

  useEffect(() => {
    if (watchImage) {
      setImagePreview(watchImage);
    }
  }, [watchImage]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setFormError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Upload through the secure server-side upload API
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Image upload failed.');
      }

      const data = await res.json();
      const imageUrl = data.secure_url;

      if (imageUrl) {
        setValue('image', imageUrl, { shouldValidate: true });
        setImagePreview(imageUrl);
      } else {
        throw new Error('Secure URL not found in upload response.');
      }
    } catch (err: any) {
      console.warn('Image upload failed, falling back to local object URL for preview:', err);
      const localUrl = URL.createObjectURL(file);
      setValue('image', 'https://images.unsplash.com/photo-1610348725531-843dff163e2c?w=500', { shouldValidate: true });
      setImagePreview(localUrl);
      setFormError(`Upload failed: ${err.message || 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: any) => {
    setFormError(null);
    try {
      const url = product ? `/api/admin/products/${product.id}` : '/api/admin/products';
      const method = product ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          // Support SKU in edit mode if it already exists
          sku: product?.sku || undefined,
        }),
      });

      const json = await res.json();
      if (json.success) {
        onSuccess();
        onClose();
      } else {
        setFormError(json.message || 'Action failed.');
      }
    } catch (err: any) {
      setFormError(err.message || 'Network error occurred.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <form 
        onSubmit={handleSubmit(onSubmit)} 
        className="bg-white rounded-3xl w-full max-w-2xl border border-slate-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-scale-in"
      >
        
        {/* Modal Header */}
        <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
          <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Modal Form body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {formError && (
            <div className="p-4 bg-amber-50 border border-amber-100 text-amber-800 rounded-2xl flex items-start gap-2.5 text-xs font-semibold">
              <AlertCircle className="h-4.5 w-4.5 shrink-0 text-amber-600" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* NAME */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Product Name</label>
              <input 
                {...register('name')}
                type="text" 
                placeholder="e.g. Fresh Organic Apples"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs font-semibold"
              />
              {errors.name && <p className="text-[10px] text-rose-500 font-bold">{errors.name.message as string}</p>}
            </div>

            {/* CATEGORY */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Category</label>
              <select
                {...register('categoryId')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs font-semibold bg-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.categoryId && <p className="text-[10px] text-rose-500 font-bold">{errors.categoryId.message as string}</p>}
            </div>

            {/* DESCRIPTION */}
            <div className="col-span-1 md:col-span-2 space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Description</label>
              <textarea 
                {...register('description')}
                rows={3}
                placeholder="Describe your organic product nutrition benefits..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs font-semibold"
              />
              {errors.description && <p className="text-[10px] text-rose-500 font-bold">{errors.description.message as string}</p>}
            </div>

            {/* PRICE */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Price (INR)</label>
              <input 
                {...register('price', { valueAsNumber: true })}
                type="number" 
                step="0.01"
                placeholder="Regular retail price"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs font-semibold"
              />
              {errors.price && <p className="text-[10px] text-rose-500 font-bold">{errors.price.message as string}</p>}
            </div>

            {/* DISCOUNT PRICE */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Discount Price (Optional)</label>
              <input 
                {...register('discountPrice', { 
                  valueAsNumber: true,
                  setValueAs: v => v === "" ? null : Number(v)
                })}
                type="number" 
                step="0.01"
                placeholder="Special offer price"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs font-semibold"
              />
              {errors.discountPrice && <p className="text-[10px] text-rose-500 font-bold">{errors.discountPrice.message as string}</p>}
            </div>

            {/* WEIGHT */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Weight</label>
              <input 
                {...register('weight', { valueAsNumber: true })}
                type="number" 
                step="0.01"
                placeholder="Weight value"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs font-semibold"
              />
              {errors.weight && <p className="text-[10px] text-rose-500 font-bold">{errors.weight.message as string}</p>}
            </div>

            {/* UNIT */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Unit</label>
              <select
                {...register('unit')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs font-semibold bg-white"
              >
                <option value="g">g (grams)</option>
                <option value="kg">kg (kilograms)</option>
                <option value="ml">ml (milliliters)</option>
                <option value="L">L (liters)</option>
                <option value="pcs">pcs (pieces)</option>
              </select>
              {errors.unit && <p className="text-[10px] text-rose-500 font-bold">{errors.unit.message as string}</p>}
            </div>

            {/* STOCK */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Initial Stock</label>
              <input 
                {...register('stock', { valueAsNumber: true })}
                type="number" 
                placeholder="Units available"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs font-semibold"
              />
              {errors.stock && <p className="text-[10px] text-rose-500 font-bold">{errors.stock.message as string}</p>}
            </div>

            {/* SKU (READ-ONLY IN EDIT MODE) */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">SKU Code</label>
              <input 
                type="text" 
                disabled={true}
                value={product?.sku || 'Auto-generated if left blank'}
                placeholder="Auto-generated if left blank"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none text-xs font-semibold bg-slate-50 text-slate-500"
              />
            </div>

            {/* IMAGE MANAGE */}
            <div className="col-span-1 md:col-span-2 space-y-3">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Product Image</label>
              
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                
                {/* Image preview */}
                <div className="h-24 w-24 border border-slate-200 rounded-2xl overflow-hidden shrink-0 bg-slate-50 flex items-center justify-center relative">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-[9px] text-slate-400 font-bold">No Image</span>
                  )}
                </div>

                {/* Upload action */}
                <div className="flex-1 space-y-2 w-full">
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-xl shadow-sm border border-slate-200 cursor-pointer transition">
                      <Upload className="h-3.5 w-3.5" />
                      {uploading ? 'Uploading...' : 'Upload Image'}
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload} 
                        className="hidden" 
                        disabled={uploading}
                      />
                    </label>
                    {uploading && <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />}
                  </div>

                  {/* Fallback image URL text input */}
                  <input 
                    {...register('image')}
                    type="text" 
                    placeholder="Or paste direct image URL (e.g. Unsplash URL)"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs font-semibold"
                  />
                  {errors.image && <p className="text-[10px] text-rose-500 font-bold">{errors.image.message as string}</p>}
                </div>

              </div>

            </div>

            {/* SWITCH TOGGLES */}
            <div className="col-span-1 md:col-span-2 flex flex-wrap gap-6 pt-2">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  {...register('isOrganic')}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/20 focus:ring-offset-0"
                />
                <span className="text-xs font-bold text-slate-700">Mark as Organic Product</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  {...register('isFeatured')}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/20 focus:ring-offset-0"
                />
                <span className="text-xs font-bold text-slate-700">Feature on Storefront</span>
              </label>
            </div>

          </div>

        </div>

        {/* Modal Buttons Footer */}
        <div className="p-6 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-700 rounded-full text-xs font-bold transition border border-slate-200 shadow-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || uploading}
            className="px-5 py-2.5 bg-[#FF6B00] hover:bg-accent text-white rounded-full text-xs font-bold transition flex items-center gap-1.5 shadow-md disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {product ? 'Save Changes' : 'Create Product'}
          </button>
        </div>

      </form>
    </div>
  );
}

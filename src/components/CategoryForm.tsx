'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createCategorySchema } from '@/validators/adminCategoryValidator';
import { X, Upload, Loader2, AlertCircle } from 'lucide-react';

interface CategoryFormProps {
  category?: any; // If editing, pass current category details
  onClose: () => void;
  onSuccess: () => void;
}

export default function CategoryForm({ category, onClose, onSuccess }: CategoryFormProps) {
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(category?.image || null);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: category?.name || '',
      slug: category?.slug || '',
      description: category?.description || '',
      displayOrder: category?.displayOrder ?? 0,
      isActive: category?.isActive ?? true,
      image: category?.image || '',
    },
  });

  const watchImage = watch('image');

  useEffect(() => {
    if (watchImage) {
      setImagePreview(watchImage);
    }
  }, [watchImage]);

  // Cloudinary or Local direct upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setFormError(null);

    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
      const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '';

      const isCloudinaryConfigured = cloudName && preset && 
        !cloudName.includes('placeholder') && !preset.includes('placeholder') && 
        cloudName !== 'demo';

      const formData = new FormData();
      let imageUrl = '';

      if (isCloudinaryConfigured) {
        formData.append('upload_preset', preset);
        formData.append('file', file);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error?.message || 'Cloudinary upload rejected.');
        }

        const data = await res.json();
        imageUrl = data.secure_url;
      } else {
        formData.append('file', file);
        // Fallback to local upload endpoint
        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || 'Local upload fallback failed.');
        }

        const data = await res.json();
        imageUrl = data.secure_url;
      }

      if (imageUrl) {
        setValue('image', imageUrl, { shouldValidate: true });
        setImagePreview(imageUrl);
      } else {
        throw new Error('Secure URL not found in upload response.');
      }
    } catch (err: any) {
      console.warn('Image upload failed, falling back to local object URL for preview:', err);
      const localUrl = URL.createObjectURL(file);
      setValue('image', 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500', { shouldValidate: true });
      setImagePreview(localUrl);
      setFormError(`Upload failed: ${err.message || 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: any) => {
    setFormError(null);
    try {
      const url = category ? `/api/admin/categories/${category.id}` : '/api/admin/categories';
      const method = category ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (json.success) {
        onSuccess();
        onClose();
      } else {
        setFormError(json.message || 'Action failed.');
      }
    } catch (err: any) {
      setFormError(err.message || 'An unexpected error occurred.');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <form 
        onSubmit={handleSubmit(onSubmit)} 
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col animate-scale-in"
      >
        
        {/* Modal Header */}
        <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
          <div>
            <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
              {category ? 'Edit Category' : 'Create Category'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Modal Form body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {formError && (
            <div className="p-4 bg-amber-50 border border-amber-100 text-amber-800 rounded-2xl flex items-start gap-2.5 text-xs font-semibold">
              <AlertCircle className="h-4.5 w-4.5 shrink-0 text-amber-600" />
              <span>{formError}</span>
            </div>
          )}

          {/* NAME */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Category Name</label>
            <input
              type="text"
              {...register('name')}
              placeholder="e.g. Organic Fruits"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs font-semibold"
            />
            {errors.name && (
              <p className="text-[10px] font-semibold text-rose-600">{errors.name.message as string}</p>
            )}
          </div>

          {/* SLUG */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Slug (Optional)</label>
            <input
              type="text"
              {...register('slug')}
              placeholder="e.g. organic-fruits (kebab-case)"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs font-semibold"
            />
            {errors.slug && (
              <p className="text-[10px] font-semibold text-rose-600">{errors.slug.message as string}</p>
            )}
          </div>

          {/* DESCRIPTION */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Description (Optional)</label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="Provide a description..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs font-semibold"
            />
            {errors.description && (
              <p className="text-[10px] font-semibold text-rose-600">{errors.description.message as string}</p>
            )}
          </div>

          {/* DISPLAY ORDER */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Display Order</label>
            <input
              type="number"
              {...register('displayOrder', { valueAsNumber: true })}
              placeholder="e.g. 0, 1, 2 (lower numbers show first)"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs font-semibold"
            />
            {errors.displayOrder && (
              <p className="text-[10px] font-semibold text-rose-600">{errors.displayOrder.message as string}</p>
            )}
          </div>

          {/* IMAGE UPLOAD */}
          <div className="space-y-3 pt-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Category Image</label>
            
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              
              <div className="h-20 w-20 border border-slate-200 rounded-2xl overflow-hidden shrink-0 bg-slate-50 flex items-center justify-center relative">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-[9px] text-slate-400 font-bold">No Image</span>
                )}
              </div>

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

                <input
                  {...register('image')}
                  type="text"
                  placeholder="Or paste direct image URL"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs font-semibold"
                />
                {errors.image && (
                  <p className="text-[10px] font-semibold text-rose-600">{errors.image.message as string}</p>
                )}
              </div>

            </div>

          </div>

          {/* ACTIVE STATUS CHECKBOX */}
          <div className="pt-2">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                {...register('isActive')}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/20 focus:ring-offset-0"
              />
              <span className="text-xs font-bold text-slate-700">Category Active & Visible to Storefront</span>
            </label>
          </div>

        </div>

        {/* Modal Buttons Footer */}
        <div className="p-6 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-750 rounded-full text-xs font-bold transition border border-slate-200 shadow-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || uploading}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-bold transition flex items-center gap-1.5 shadow-md disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {category ? 'Save Changes' : 'Create Category'}
          </button>
        </div>

      </form>
    </div>
  );
}

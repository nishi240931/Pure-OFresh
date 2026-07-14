'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createCategorySchema } from '@/validators/adminCategoryValidator';
import { X, Upload, Loader2, AlertCircle } from 'lucide-react';

interface CategoryFormProps {
  category?: any; // If editing, pass current category
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
      displayOrder: category?.displayOrder !== undefined ? category.displayOrder : 0,
      isActive: category?.isActive !== undefined ? category.isActive : true,
      image: category?.image || '',
    },
  });

  const watchImage = watch('image');

  useEffect(() => {
    if (watchImage) {
      setImagePreview(watchImage);
    }
  }, [watchImage]);

  // Cloudinary direct upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setFormError(null);

    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'demo';
      const preset = 'ml_default'; // Standard fallback preset

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', preset);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Cloudinary upload rejected. Preset may not be active.');
      }

      const data = await res.json();
      if (data.secure_url) {
        setValue('image', data.secure_url, { shouldValidate: true });
        setImagePreview(data.secure_url);
      } else {
        throw new Error('Cloudinary secure url not found in response.');
      }
    } catch (err: any) {
      console.warn('Cloudinary upload failed, falling back to local object URL for preview:', err);
      const localUrl = URL.createObjectURL(file);
      setValue('image', 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500', { shouldValidate: true });
      setImagePreview(localUrl);
      setFormError('Cloudinary preset error: fallbacked to default placeholder image.');
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
      console.error('Error saving category:', err);
      setFormError(err.message || 'An unexpected error occurred.');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[32px] border border-slate-200/60 shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-extrabold font-display text-slate-800 tracking-tight">
              {category ? 'Edit Category' : 'Create Category'}
            </h2>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              {category ? 'Update the details and visibility of this category' : 'Define a new product segment'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="h-9 w-9 flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {formError && (
          <div className="p-4 bg-rose-550/10 border border-rose-550/20 rounded-2xl flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-rose-605 mt-0.5 shrink-0" />
            <p className="text-xs font-semibold text-rose-605">{formError}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Category Name</label>
            <input
              type="text"
              {...register('name')}
              placeholder="e.g. Fresh Fruits"
              className="w-full text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200/70 rounded-2xl px-4 py-3 placeholder:text-slate-400 focus:outline-none focus:border-slate-350 focus:bg-white transition-colors"
            />
            {errors.name && (
              <p className="text-[10px] font-semibold text-rose-600">{errors.name.message as string}</p>
            )}
          </div>

          {/* Slug */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Slug <span className="text-slate-400 font-normal">(Optional - will auto-generate if empty)</span>
            </label>
            <input
              type="text"
              {...register('slug')}
              placeholder="e.g. fresh-fruits"
              className="w-full text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200/70 rounded-2xl px-4 py-3 placeholder:text-slate-400 focus:outline-none focus:border-slate-350 focus:bg-white transition-colors"
            />
            {errors.slug && (
              <p className="text-[10px] font-semibold text-rose-600">{errors.slug.message as string}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Description</label>
            <textarea
              rows={3}
              {...register('description')}
              placeholder="Provide a brief summary of the products in this category..."
              className="w-full text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200/70 rounded-2xl p-4 placeholder:text-slate-400 focus:outline-none focus:border-slate-350 focus:bg-white resize-none transition-colors"
            />
            {errors.description && (
              <p className="text-[10px] font-semibold text-rose-600">{errors.description.message as string}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Display Order */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Display Order</label>
              <input
                type="number"
                {...register('displayOrder', { valueAsNumber: true })}
                className="w-full text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200/70 rounded-2xl px-4 py-3 focus:outline-none focus:border-slate-350 focus:bg-white transition-colors"
              />
              {errors.displayOrder && (
                <p className="text-[10px] font-semibold text-rose-600">{errors.displayOrder.message as string}</p>
              )}
            </div>

            {/* Is Active */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Active Status</label>
              <div className="flex items-center h-[46px]">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('isActive')}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  <span className="ml-3 text-xs font-semibold text-slate-600">
                    {watch('isActive') ? 'Active' : 'Inactive'}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Image Uploader */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Category Image</label>
            <div className="flex items-center gap-4">
              {imagePreview ? (
                <div className="h-16 w-16 bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shrink-0">
                  <img
                    src={imagePreview}
                    alt="Category Preview"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as any).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500';
                    }}
                  />
                </div>
              ) : (
                <div className="h-16 w-16 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-center text-slate-350 shrink-0">
                  <Upload className="h-5 w-5" />
                </div>
              )}

              <div className="flex-1 space-y-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  id="category-file-upload"
                  className="hidden"
                />
                <label
                  htmlFor="category-file-upload"
                  className="inline-flex items-center gap-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/70 cursor-pointer px-4 py-2 rounded-xl text-xs font-bold text-slate-650 transition-colors"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-500" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-3.5 w-3.5 text-slate-500" />
                      Upload Image
                    </>
                  )}
                </label>
                <p className="text-[9px] text-slate-400 font-medium">PNG, JPG, or JPEG formats. Handled directly via Cloudinary.</p>
              </div>
            </div>
            {/* hidden text field to bind image URL in form */}
            <input type="hidden" {...register('image')} />
            {errors.image && (
              <p className="text-[10px] font-semibold text-rose-600">{errors.image.message as string}</p>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-2xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || uploading}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-2xl transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Category'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

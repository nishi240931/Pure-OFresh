import { adminCategoryRepository } from '@/repositories/adminCategoryRepository';
import { createCategorySchema, updateCategorySchema } from '@/validators/adminCategoryValidator';

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-'); // Replace multiple - with single -
}

export class AdminCategoryService {
  async getCategories(params: {
    search?: string;
    isActiveStatus?: 'all' | 'active' | 'inactive';
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page: number;
    limit: number;
  }) {
    return adminCategoryRepository.getCategories(params);
  }

  async getCategoryById(id: string) {
    const category = await adminCategoryRepository.getCategoryById(id);
    if (!category) {
      throw new Error('Category not found.');
    }
    return category;
  }

  async createCategory(input: any) {
    const validated = createCategorySchema.safeParse(input);
    if (!validated.success) {
      const errorMsg = validated.error.issues.map((i) => i.message).join(', ');
      throw new Error(`Validation failed: ${errorMsg}`);
    }

    const { name, description, displayOrder, isActive, image } = validated.data;
    
    // Auto-generate slug if not provided, or normalize it
    const slug = validated.data.slug ? slugify(validated.data.slug) : slugify(name);

    // Validate duplicate name & slug
    const hasDuplicateName = await adminCategoryRepository.checkDuplicateName(name);
    if (hasDuplicateName) {
      throw new Error(`Category name "${name}" is already in use.`);
    }

    const hasDuplicateSlug = await adminCategoryRepository.checkDuplicateSlug(slug);
    if (hasDuplicateSlug) {
      throw new Error(`Category slug "${slug}" is already in use.`);
    }

    // Default image if empty
    const finalImage = image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80';

    return adminCategoryRepository.createCategory({
      name,
      slug,
      description,
      displayOrder: displayOrder ?? 0,
      isActive: isActive ?? true,
      image: finalImage,
    });
  }

  async updateCategory(id: string, input: any) {
    const validated = updateCategorySchema.safeParse(input);
    if (!validated.success) {
      const errorMsg = validated.error.issues.map((i) => i.message).join(', ');
      throw new Error(`Validation failed: ${errorMsg}`);
    }

    const existing = await adminCategoryRepository.getCategoryById(id);
    if (!existing) {
      throw new Error('Category not found.');
    }

    const { name, slug: inputSlug, description, displayOrder, isActive, image } = validated.data;

    const updateData: any = {};

    if (name !== undefined) {
      const hasDuplicateName = await adminCategoryRepository.checkDuplicateName(name, id);
      if (hasDuplicateName) {
        throw new Error(`Category name "${name}" is already in use.`);
      }
      updateData.name = name;
    }

    if (inputSlug !== undefined || name !== undefined) {
      const targetSlug = inputSlug ? slugify(inputSlug) : (name ? slugify(name) : existing.slug);
      const hasDuplicateSlug = await adminCategoryRepository.checkDuplicateSlug(targetSlug, id);
      if (hasDuplicateSlug) {
        throw new Error(`Category slug "${targetSlug}" is already in use.`);
      }
      updateData.slug = targetSlug;
    }

    if (description !== undefined) updateData.description = description;
    if (displayOrder !== undefined) updateData.displayOrder = displayOrder;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (image !== undefined) updateData.image = image;

    return adminCategoryRepository.updateCategory(id, updateData);
  }

  async deleteCategory(id: string) {
    const existing = await adminCategoryRepository.getCategoryById(id);
    if (!existing) {
      throw new Error('Category not found.');
    }

    if (existing.productCount > 0) {
      throw new Error('Category contains products and cannot be deleted.');
    }

    return adminCategoryRepository.deleteCategory(id);
  }

  async toggleCategoryStatus(id: string) {
    const existing = await adminCategoryRepository.getCategoryById(id);
    if (!existing) {
      throw new Error('Category not found.');
    }
    return adminCategoryRepository.toggleActiveStatus(id);
  }
}

export const adminCategoryService = new AdminCategoryService();

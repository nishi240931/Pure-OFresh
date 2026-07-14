import { categoryRepository } from '@/repositories/categoryRepository';
import { categorySchema, CategoryInput } from '@/validators/catalogValidator';
import { Category } from '@prisma/client';
import { db } from '@/lib/db';

export class CategoryService {
  async getAllCategories(): Promise<Category[]> {
    return categoryRepository.findAll();
  }

  async getCategoryById(id: string): Promise<Category> {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw new Error(`Category not found with ID: ${id}`);
    }
    return category;
  }

  async getCategoryBySlug(slug: string): Promise<Category> {
    const category = await categoryRepository.findBySlug(slug);
    if (!category) {
      throw new Error(`Category not found with slug: ${slug}`);
    }
    return category;
  }

  async createCategory(input: CategoryInput): Promise<Category> {
    const validated = categorySchema.safeParse(input);
    if (!validated.success) {
      throw new Error(`Validation failed: ${validated.error.message}`);
    }

    const existing = await categoryRepository.findBySlug(validated.data.slug);
    if (existing) {
      throw new Error(`Category already exists with slug: ${validated.data.slug}`);
    }

    return categoryRepository.create(validated.data);
  }

  async updateCategory(id: string, input: Partial<CategoryInput>): Promise<Category> {
    const schemaPartial = categorySchema.partial();
    const validated = schemaPartial.safeParse(input);
    if (!validated.success) {
      throw new Error(`Validation failed: ${validated.error.message}`);
    }

    const existingCategory = await categoryRepository.findById(id);
    if (!existingCategory) {
      throw new Error(`Category not found with ID: ${id}`);
    }

    if (validated.data.slug && validated.data.slug !== existingCategory.slug) {
      const duplicate = await categoryRepository.findBySlug(validated.data.slug);
      if (duplicate) {
        throw new Error(`Category already exists with slug: ${validated.data.slug}`);
      }
    }

    return categoryRepository.update(id, validated.data);
  }

  async deleteCategory(id: string): Promise<Category> {
    const existing = await categoryRepository.findById(id);
    if (!existing) {
      throw new Error(`Category not found with ID: ${id}`);
    }

    // Check if there are products referencing this category
    const productsCount = await db.product.count({
      where: { categoryId: id },
    });

    if (productsCount > 0) {
      throw new Error(`Cannot delete category: ${productsCount} products are still linked to it.`);
    }

    return categoryRepository.delete(id);
  }
}

export const categoryService = new CategoryService();

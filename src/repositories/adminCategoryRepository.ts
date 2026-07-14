import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export class AdminCategoryRepository {
  async getCategories(params: {
    search?: string;
    isActiveStatus?: 'all' | 'active' | 'inactive';
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page: number;
    limit: number;
  }) {
    const { search, isActiveStatus, sortBy = 'displayOrder', sortOrder = 'asc', page, limit } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.CategoryWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isActiveStatus && isActiveStatus !== 'all') {
      where.isActive = isActiveStatus === 'active';
    }

    const orderBy: any = {};
    if (sortBy === 'productCount') {
      orderBy.products = {
        _count: sortOrder,
      };
    } else if (sortBy === 'name' || sortBy === 'createdAt' || sortBy === 'displayOrder') {
      orderBy[sortBy] = sortOrder;
    } else {
      orderBy.displayOrder = 'asc';
    }

    const [categories, total] = await Promise.all([
      db.category.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          _count: {
            select: { products: true }
          }
        }
      }),
      db.category.count({ where }),
    ]);

    // Map _count.products to productCount for clean presentation
    const mappedCategories = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      image: cat.image,
      description: cat.description,
      isActive: cat.isActive,
      displayOrder: cat.displayOrder,
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt,
      productCount: cat._count.products,
    }));

    return { categories: mappedCategories, total };
  }

  async getCategoryById(id: string) {
    const cat = await db.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });
    if (!cat) return null;
    return {
      ...cat,
      productCount: cat._count.products,
    };
  }

  async findBySlug(slug: string) {
    return db.category.findUnique({
      where: { slug },
    });
  }

  async createCategory(data: Prisma.CategoryCreateInput) {
    return db.category.create({
      data,
    });
  }

  async updateCategory(id: string, data: Prisma.CategoryUpdateInput) {
    return db.category.update({
      where: { id },
      data,
    });
  }

  async deleteCategory(id: string) {
    return db.category.delete({
      where: { id },
    });
  }

  async toggleActiveStatus(id: string) {
    const cat = await db.category.findUnique({ where: { id } });
    if (!cat) throw new Error('Category not found.');
    return db.category.update({
      where: { id },
      data: { isActive: !cat.isActive },
    });
  }

  async checkDuplicateSlug(slug: string, excludeId?: string): Promise<boolean> {
    const where: Prisma.CategoryWhereInput = { slug };
    if (excludeId) {
      where.id = { not: excludeId };
    }
    const count = await db.category.count({ where });
    return count > 0;
  }

  async checkDuplicateName(name: string, excludeId?: string): Promise<boolean> {
    const where: Prisma.CategoryWhereInput = { name: { equals: name, mode: 'insensitive' } };
    if (excludeId) {
      where.id = { not: excludeId };
    }
    const count = await db.category.count({ where });
    return count > 0;
  }
}

export const adminCategoryRepository = new AdminCategoryRepository();

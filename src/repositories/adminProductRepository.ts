import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export class AdminProductRepository {
  async getProducts(params: {
    search?: string;
    categoryId?: string;
    stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock';
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page: number;
    limit: number;
  }) {
    const { search, categoryId, stockStatus, sortBy = 'createdAt', sortOrder = 'desc', page, limit } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId && categoryId !== 'all') {
      where.categoryId = categoryId;
    }

    if (stockStatus) {
      if (stockStatus === 'in_stock') {
        where.stock = { gte: 20 };
      } else if (stockStatus === 'low_stock') {
        where.stock = { lt: 20, gt: 0 };
      } else if (stockStatus === 'out_of_stock') {
        where.stock = 0;
      }
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput = {};
    if (sortBy === 'name' || sortBy === 'price' || sortBy === 'stock' || sortBy === 'rating' || sortBy === 'createdAt') {
      orderBy[sortBy] = sortOrder;
    } else {
      orderBy.createdAt = 'desc';
    }

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: {
            select: {
              name: true,
            },
          },
        },
      }),
      db.product.count({ where }),
    ]);

    return { products, total };
  }

  async getProductById(id: string) {
    return db.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });
  }

  async createProduct(data: Prisma.ProductUncheckedCreateInput) {
    return db.product.create({
      data,
    });
  }

  async updateProduct(id: string, data: Prisma.ProductUncheckedUpdateInput) {
    return db.product.update({
      where: { id },
      data,
    });
  }

  async deleteProduct(id: string) {
    return db.product.delete({
      where: { id },
    });
  }

  async updateStock(id: string, stock: number) {
    return db.product.update({
      where: { id },
      data: { stock },
    });
  }

  async toggleFeatured(id: string, isFeatured: boolean) {
    return db.product.update({
      where: { id },
      data: { isFeatured },
    });
  }

  async toggleOrganic(id: string, isOrganic: boolean) {
    return db.product.update({
      where: { id },
      data: { isOrganic },
    });
  }
}

export const adminProductRepository = new AdminProductRepository();

import { db } from '@/lib/db';
import { Product, Unit } from '@prisma/client';

export class ProductRepository {
  async findAll(filters?: {
    categorySlug?: string;
    minPrice?: number;
    maxPrice?: number;
    organic?: boolean;
    featured?: boolean;
    inStock?: boolean;
    sort?: 'price_asc' | 'price_desc' | 'rating_desc' | 'discount_desc' | 'newest' | 'featured';
    page?: number;
    limit?: number;
  }): Promise<{ products: Product[]; count: number }> {
    const where: any = {};

    if (filters?.categorySlug) {
      where.category = {
        slug: filters.categorySlug,
      };
    }

    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      const min = filters.minPrice !== undefined ? filters.minPrice : 0;
      const max = filters.maxPrice !== undefined ? filters.maxPrice : 999999;
      
      where.OR = [
        {
          discountPrice: {
            not: null,
            gte: min,
            lte: max,
          },
        },
        {
          discountPrice: null,
          price: {
            gte: min,
            lte: max,
          },
        },
      ];
    }

    if (filters?.organic !== undefined) {
      where.isOrganic = filters.organic;
    }

    if (filters?.featured !== undefined) {
      where.isFeatured = filters.featured;
    }

    if (filters?.inStock !== undefined) {
      if (filters.inStock) {
        where.stock = { gt: 0 };
      } else {
        where.stock = 0;
      }
    }

    let orderBy: any = { name: 'asc' };

    if (filters?.sort) {
      switch (filters.sort) {
        case 'price_asc':
          orderBy = { price: 'asc' };
          break;
        case 'price_desc':
          orderBy = { price: 'desc' };
          break;
        case 'rating_desc':
          orderBy = { rating: 'desc' };
          break;
        case 'discount_desc':
          orderBy = { discountPrice: 'asc' };
          break;
        case 'newest':
          orderBy = { createdAt: 'desc' };
          break;
        case 'featured':
          orderBy = { isFeatured: 'desc' };
          break;
      }
    }

    const page = filters?.page;
    const limit = filters?.limit;

    if (page !== undefined && limit !== undefined) {
      const skip = (page - 1) * limit;
      const take = limit;

      const [products, count] = await db.$transaction([
        db.product.findMany({
          where,
          orderBy,
          skip,
          take,
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            image: true,
            images: true,
            price: true,
            discountPrice: true,
            weight: true,
            unit: true,
            stock: true,
            sku: true,
            rating: true,
            reviewCount: true,
            isOrganic: true,
            isFeatured: true,
            categoryId: true,
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        }),
        db.product.count({ where }),
      ]);

      return {
        products: products as unknown as Product[],
        count,
      };
    } else {
      const [products, count] = await db.$transaction([
        db.product.findMany({
          where,
          orderBy,
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            image: true,
            images: true,
            price: true,
            discountPrice: true,
            weight: true,
            unit: true,
            stock: true,
            sku: true,
            rating: true,
            reviewCount: true,
            isOrganic: true,
            isFeatured: true,
            categoryId: true,
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        }),
        db.product.count({ where }),
      ]);

      return {
        products: products as unknown as Product[],
        count,
      };
    }
  }

  async findById(id: string): Promise<Product | null> {
    return db.product.findUnique({
      where: { id },
      include: { category: true },
    });
  }

  async findBySlug(slug: string): Promise<Product | null> {
    return db.product.findUnique({
      where: { slug },
      include: { category: true },
    });
  }

  async findBySku(sku: string): Promise<Product | null> {
    return db.product.findUnique({
      where: { sku },
    });
  }

  async create(data: {
    name: string;
    slug: string;
    description: string;
    image: string;
    images?: string[];
    price: number;
    discountPrice?: number | null;
    weight: number;
    unit: Unit;
    stock: number;
    sku: string;
    rating?: number;
    reviewCount?: number;
    isOrganic?: boolean;
    isFeatured?: boolean;
    categoryId: string;
  }): Promise<Product> {
    return db.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        image: data.image,
        images: data.images ?? [data.image],
        price: data.price,
        discountPrice: data.discountPrice,
        weight: data.weight,
        unit: data.unit,
        stock: data.stock,
        sku: data.sku,
        rating: data.rating ?? 5.0,
        reviewCount: data.reviewCount ?? 0,
        isOrganic: data.isOrganic ?? false,
        isFeatured: data.isFeatured ?? false,
        categoryId: data.categoryId,
      },
    });
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      slug: string;
      description: string;
      image: string;
      images: string[];
      price: number;
      discountPrice: number | null;
      weight: number;
      unit: Unit;
      stock: number;
      sku: string;
      rating: number;
      reviewCount: number;
      isOrganic: boolean;
      isFeatured: boolean;
      categoryId: string;
    }>
  ): Promise<Product> {
    return db.product.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Product> {
    return db.product.delete({
      where: { id },
    });
  }
}

export const productRepository = new ProductRepository();

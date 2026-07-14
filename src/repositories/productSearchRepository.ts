import { db } from '@/lib/db';

export class ProductSearchRepository {
  async search(query: string, limit: number) {
    return db.product.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { sku: { contains: query, mode: 'insensitive' } },
          {
            category: {
              name: { contains: query, mode: 'insensitive' },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        price: true,
        discountPrice: true,
        rating: true,
        isOrganic: true,
        categoryId: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      take: limit,
      orderBy: { name: 'asc' },
    });
  }
}

export const productSearchRepository = new ProductSearchRepository();

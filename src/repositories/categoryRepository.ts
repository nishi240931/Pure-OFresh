import { db } from '@/lib/db';
import { Category } from '@prisma/client';

export class CategoryRepository {
  async findAll(): Promise<Category[]> {
    return db.category.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string): Promise<Category | null> {
    return db.category.findUnique({
      where: { id },
    });
  }

  async findBySlug(slug: string): Promise<Category | null> {
    return db.category.findUnique({
      where: { slug },
    });
  }

  async create(data: {
    name: string;
    slug: string;
    description?: string | null;
    image: string;
  }): Promise<Category> {
    return db.category.create({
      data,
    });
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      slug: string;
      description: string | null;
      image: string;
    }>
  ): Promise<Category> {
    return db.category.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Category> {
    return db.category.delete({
      where: { id },
    });
  }
}

export const categoryRepository = new CategoryRepository();

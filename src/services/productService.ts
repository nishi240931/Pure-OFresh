import { productRepository } from '@/repositories/productRepository';
import { categoryRepository } from '@/repositories/categoryRepository';
import { productSchema, ProductInput } from '@/validators/catalogValidator';
import { filterSchema } from '@/validators/filterValidator';
import { Product } from '@prisma/client';

export class ProductService {
  async getAllProducts(filters?: any): Promise<{
    products: Product[];
    pagination: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  }> {
    const validated = filterSchema.safeParse(filters || {});
    if (!validated.success) {
      const errorMsg = validated.error.issues.map((i) => i.message).join(', ');
      throw new Error(`Validation failed: ${errorMsg}`);
    }

    const page = validated.data.page || 1;
    const limit = validated.data.limit || 20;

    const { products, count } = await productRepository.findAll({
      categorySlug: validated.data.category,
      minPrice: validated.data.minPrice,
      maxPrice: validated.data.maxPrice,
      organic: validated.data.organic,
      featured: validated.data.featured,
      inStock: validated.data.inStock,
      sort: validated.data.sort,
      page,
      limit,
    });

    const totalPages = Math.ceil(count / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
      products,
      pagination: {
        page,
        limit,
        totalItems: count,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    };
  }

  async getProductById(id: string): Promise<Product> {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new Error(`Product not found with ID: ${id}`);
    }
    return product;
  }

  async getProductBySlug(slug: string): Promise<Product> {
    const product = await productRepository.findBySlug(slug);
    if (!product) {
      throw new Error(`Product not found with slug: ${slug}`);
    }
    return product;
  }

  async createProduct(input: ProductInput): Promise<Product> {
    const validated = productSchema.safeParse(input);
    if (!validated.success) {
      throw new Error(`Validation failed: ${validated.error.message}`);
    }

    // Check if category exists
    const category = await categoryRepository.findById(validated.data.categoryId);
    if (!category) {
      throw new Error(`Category not found with ID: ${validated.data.categoryId}`);
    }

    // Check SKU duplicate
    const existingSku = await productRepository.findBySku(validated.data.sku);
    if (existingSku) {
      throw new Error(`Product already exists with SKU: ${validated.data.sku}`);
    }

    // Check slug duplicate
    const slug = validated.data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const existingSlug = await productRepository.findBySlug(slug);
    if (existingSlug) {
      throw new Error(`Product already exists with slug: ${slug}`);
    }

    return productRepository.create({
      ...validated.data,
      slug,
    });
  }

  async updateProduct(id: string, input: Partial<ProductInput>): Promise<Product> {
    const schemaPartial = productSchema.partial();
    const validated = schemaPartial.safeParse(input);
    if (!validated.success) {
      throw new Error(`Validation failed: ${validated.error.message}`);
    }

    const existingProduct = await productRepository.findById(id);
    if (!existingProduct) {
      throw new Error(`Product not found with ID: ${id}`);
    }

    if (validated.data.categoryId) {
      const category = await categoryRepository.findById(validated.data.categoryId);
      if (!category) {
        throw new Error(`Category not found with ID: ${validated.data.categoryId}`);
      }
    }

    if (validated.data.sku && validated.data.sku !== existingProduct.sku) {
      const duplicateSku = await productRepository.findBySku(validated.data.sku);
      if (duplicateSku) {
        throw new Error(`Product already exists with SKU: ${validated.data.sku}`);
      }
    }

    let slug = existingProduct.slug;
    if (validated.data.name && validated.data.name !== existingProduct.name) {
      slug = validated.data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const duplicateSlug = await productRepository.findBySlug(slug);
      if (duplicateSlug) {
        throw new Error(`Product already exists with slug: ${slug}`);
      }
    }

    return productRepository.update(id, {
      ...validated.data,
      slug,
    });
  }

  async deleteProduct(id: string): Promise<Product> {
    const existing = await productRepository.findById(id);
    if (!existing) {
      throw new Error(`Product not found with ID: ${id}`);
    }
    return productRepository.delete(id);
  }
}

export const productService = new ProductService();

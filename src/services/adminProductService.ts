import { adminProductRepository } from '@/repositories/adminProductRepository';
import { adminProductSchema } from '@/validators/adminProductValidator';
import { db } from '@/lib/db';
import { OrderStatus } from '@prisma/client';

export class AdminProductService {
  async getProducts(params: {
    search?: string;
    categoryId?: string;
    stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock';
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page: number;
    limit: number;
  }) {
    return adminProductRepository.getProducts(params);
  }

  async getProductById(id: string) {
    const product = await adminProductRepository.getProductById(id);
    if (!product) {
      throw new Error('Product not found.');
    }
    return product;
  }

  async createProduct(inputData: any) {
    const validated = adminProductSchema.parse(inputData);

    // Generate slug from name
    const slug = validated.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check unique name/slug
    const existingSlug = await db.product.findUnique({
      where: { slug },
    });
    if (existingSlug) {
      throw new Error('A product with this name already exists.');
    }

    // Generate unique SKU if not provided
    let sku = inputData.sku;
    if (!sku) {
      const cleanPrefix = validated.name.substring(0, 3).replace(/[^a-zA-Z]/g, 'X').toUpperCase();
      sku = `POF-${cleanPrefix}-${Math.floor(10000 + Math.random() * 90000)}`;
    }

    // Ensure unique SKU
    const existingSku = await db.product.findUnique({
      where: { sku },
    });
    if (existingSku) {
      throw new Error(`Product SKU ${sku} is already assigned.`);
    }

    // Calculate weight and unit
    const dbProductData = {
      name: validated.name,
      slug,
      sku,
      description: validated.description,
      image: validated.image,
      images: validated.images || [validated.image],
      price: validated.price,
      discountPrice: validated.discountPrice || null,
      weight: validated.weight,
      unit: validated.unit,
      stock: validated.stock,
      isOrganic: validated.isOrganic,
      isFeatured: validated.isFeatured,
      categoryId: validated.categoryId,
    };

    return adminProductRepository.createProduct(dbProductData);
  }

  async updateProduct(id: string, inputData: any) {
    const product = await adminProductRepository.getProductById(id);
    if (!product) {
      throw new Error('Product to update not found.');
    }

    const validated = adminProductSchema.parse(inputData);

    const slug = validated.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check slug collision (excluding current product)
    const existingSlug = await db.product.findFirst({
      where: {
        slug,
        id: { not: id },
      },
    });
    if (existingSlug) {
      throw new Error('Another product with this name already exists.');
    }

    // SKU verification
    const sku = inputData.sku || product.sku;
    const existingSku = await db.product.findFirst({
      where: {
        sku,
        id: { not: id },
      },
    });
    if (existingSku) {
      throw new Error(`SKU ${sku} is already assigned to another product.`);
    }

    const updateData = {
      name: validated.name,
      slug,
      sku,
      description: validated.description,
      image: validated.image,
      images: validated.images || [validated.image],
      price: validated.price,
      discountPrice: validated.discountPrice || null,
      weight: validated.weight,
      unit: validated.unit,
      stock: validated.stock,
      isOrganic: validated.isOrganic,
      isFeatured: validated.isFeatured,
      categoryId: validated.categoryId,
    };

    return adminProductRepository.updateProduct(id, updateData);
  }

  async deleteProduct(id: string) {
    const product = await adminProductRepository.getProductById(id);
    if (!product) {
      throw new Error('Product not found.');
    }

    // Step 9: Check active orders protection
    const items = await db.orderItem.findMany({
      where: { productId: id },
      include: {
        order: {
          select: {
            orderStatus: true,
            orderNumber: true,
          },
        },
      },
    });

    if (items.length > 0) {
      const activeOrders = items.filter(
        (item) =>
          item.order.orderStatus !== OrderStatus.DELIVERED &&
          item.order.orderStatus !== OrderStatus.CANCELLED
      );

      if (activeOrders.length > 0) {
        const orderNums = activeOrders.map((o) => o.order.orderNumber).join(', ');
        throw new Error(`Cannot delete product as it is currently part of active orders: ${orderNums}`);
      } else {
        throw new Error(
          'Cannot delete product because it belongs to past completed orders. Consider setting its stock to 0 or marking it out of stock instead.'
        );
      }
    }

    return adminProductRepository.deleteProduct(id);
  }

  async updateStock(id: string, stock: number) {
    const product = await adminProductRepository.getProductById(id);
    if (!product) {
      throw new Error('Product not found.');
    }
    return adminProductRepository.updateStock(id, stock);
  }

  async toggleFeatured(id: string, isFeatured: boolean) {
    const product = await adminProductRepository.getProductById(id);
    if (!product) {
      throw new Error('Product not found.');
    }
    return adminProductRepository.toggleFeatured(id, isFeatured);
  }

  async toggleOrganic(id: string, isOrganic: boolean) {
    const product = await adminProductRepository.getProductById(id);
    if (!product) {
      throw new Error('Product not found.');
    }
    return adminProductRepository.toggleOrganic(id, isOrganic);
  }
}

export const adminProductService = new AdminProductService();

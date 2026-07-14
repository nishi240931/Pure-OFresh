import { db } from '@/lib/db';
import { Cart, CartItem } from '@prisma/client';

export class CartRepository {
  async getCartByUserId(userId: string) {
    return db.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                image: true,
                price: true,
                discountPrice: true,
                stock: true,
                sku: true,
                weight: true,
                unit: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });
  }

  async createCart(userId: string): Promise<Cart> {
    return db.cart.create({
      data: {
        userId,
      },
    });
  }

  async findCartItem(cartId: string, productId: string) {
    return db.cartItem.findFirst({
      where: {
        cartId,
        productId,
      },
    });
  }

  async findCartItemById(itemId: string) {
    return db.cartItem.findUnique({
      where: { id: itemId },
      include: {
        cart: true,
      },
    });
  }

  async addItem(cartId: string, productId: string, quantity: number, priceAtAddition: number): Promise<CartItem> {
    return db.cartItem.create({
      data: {
        cartId,
        productId,
        quantity,
        priceAtAddition,
      },
    });
  }

  async updateItemQuantity(itemId: string, quantity: number): Promise<CartItem> {
    return db.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
  }

  async removeItem(itemId: string): Promise<CartItem> {
    return db.cartItem.delete({
      where: { id: itemId },
    });
  }

  async clearCart(cartId: string) {
    return db.cartItem.deleteMany({
      where: { cartId },
    });
  }
}

export const cartRepository = new CartRepository();

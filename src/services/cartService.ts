import { cartRepository } from '@/repositories/cartRepository';
import { productRepository } from '@/repositories/productRepository';

export class CartService {
  // Helper to format the cart with server-side totals calculation
  formatCartResponse(cart: any) {
    const items = cart?.items || [];
    
    let totalItems = 0;
    let subtotal = 0;
    
    const formattedItems = items.map((item: any) => {
      totalItems += item.quantity;
      const activePrice = item.product.discountPrice !== null && item.product.discountPrice !== undefined
        ? item.product.discountPrice
        : item.product.price;
      subtotal += activePrice * item.quantity;
      
      return {
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        priceAtAddition: item.priceAtAddition,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        product: {
          ...item.product,
          discount: item.product.discountPrice
            ? Math.round(((item.product.price - item.product.discountPrice) / item.product.price) * 100)
            : 0,
        },
      };
    });

    const deliveryFee = 40;
    const gst = Math.round(subtotal * 0.05 * 100) / 100; // 5% GST
    const grandTotal = subtotal + deliveryFee + gst;

    return {
      cart: {
        id: cart.id,
        userId: cart.userId,
        items: formattedItems,
        createdAt: cart.createdAt,
        updatedAt: cart.updatedAt,
      },
      summary: {
        totalItems,
        subtotal,
        deliveryFee,
        gst,
        grandTotal,
      },
    };
  }

  async getCart(userId: string) {
    let cart: any = await cartRepository.getCartByUserId(userId);
    if (!cart) {
      cart = await cartRepository.createCart(userId);
      // refetch to include empty items array and relations
      cart = await cartRepository.getCartByUserId(userId);
    }
    return this.formatCartResponse(cart);
  }

  async addToCart(userId: string, productId: string, quantity: number) {
    const product = await productRepository.findById(productId);
    if (!product) {
      throw new Error('Product not found.');
    }

    if (product.stock <= 0) {
      const err = new Error('Product is out of stock.');
      (err as any).code = 'OUT_OF_STOCK';
      throw err;
    }

    let cart: any = await cartRepository.getCartByUserId(userId);
    if (!cart) {
      cart = await cartRepository.createCart(userId);
    }

    const existingItem = await cartRepository.findCartItem(cart.id, productId);
    const targetQuantity = (existingItem?.quantity || 0) + quantity;

    if (targetQuantity > product.stock) {
      const err = new Error(`Cannot add more than available stock (${product.stock} items).`);
      (err as any).code = 'OUT_OF_STOCK';
      throw err;
    }

    const activePrice = product.discountPrice !== null && product.discountPrice !== undefined
      ? product.discountPrice
      : product.price;

    if (existingItem) {
      await cartRepository.updateItemQuantity(existingItem.id, targetQuantity);
    } else {
      await cartRepository.addItem(cart.id, productId, quantity, activePrice);
    }

    // Return the updated cart
    const updatedCart = await cartRepository.getCartByUserId(userId);
    return this.formatCartResponse(updatedCart);
  }

  async updateItemQuantity(userId: string, itemId: string, quantity: number) {
    if (quantity < 1) {
      throw new Error('Quantity must be at least 1.');
    }

    const cartItem = await cartRepository.findCartItemById(itemId);
    if (!cartItem) {
      throw new Error('Cart item not found.');
    }

    // Security check: item must belong to the user's cart
    const userCart = await cartRepository.getCartByUserId(userId);
    if (!userCart || cartItem.cartId !== userCart.id) {
      throw new Error('Unauthorized access to cart item.');
    }

    const product = await productRepository.findById(cartItem.productId);
    if (!product) {
      throw new Error('Product not found.');
    }

    if (quantity > product.stock) {
      const err = new Error(`Cannot set quantity higher than available stock (${product.stock} items).`);
      (err as any).code = 'OUT_OF_STOCK';
      throw err;
    }

    await cartRepository.updateItemQuantity(itemId, quantity);

    const updatedCart = await cartRepository.getCartByUserId(userId);
    return this.formatCartResponse(updatedCart);
  }

  async removeItem(userId: string, itemId: string) {
    const cartItem = await cartRepository.findCartItemById(itemId);
    if (!cartItem) {
      throw new Error('Cart item not found.');
    }

    const userCart = await cartRepository.getCartByUserId(userId);
    if (!userCart || cartItem.cartId !== userCart.id) {
      throw new Error('Unauthorized access to cart item.');
    }

    await cartRepository.removeItem(itemId);

    const updatedCart = await cartRepository.getCartByUserId(userId);
    return this.formatCartResponse(updatedCart);
  }

  async clearCart(userId: string) {
    let userCart: any = await cartRepository.getCartByUserId(userId);
    if (!userCart) {
      userCart = await cartRepository.createCart(userId);
    }

    await cartRepository.clearCart(userCart.id);

    const updatedCart = await cartRepository.getCartByUserId(userId);
    return this.formatCartResponse(updatedCart);
  }

  async mergeCart(userId: string, guestItems: { productId: string; quantity: number }[]) {
    let userCart: any = await cartRepository.getCartByUserId(userId);
    if (!userCart) {
      userCart = await cartRepository.createCart(userId);
    }

    for (const item of guestItems) {
      try {
        const product = await productRepository.findById(item.productId);
        if (!product || product.stock <= 0) continue;

        const existingItem = await cartRepository.findCartItem(userCart.id, item.productId);
        const activePrice = product.discountPrice !== null && product.discountPrice !== undefined
          ? product.discountPrice
          : product.price;

        const combinedQuantity = (existingItem?.quantity || 0) + item.quantity;
        const finalQuantity = Math.min(combinedQuantity, product.stock);

        if (existingItem) {
          await cartRepository.updateItemQuantity(existingItem.id, finalQuantity);
        } else {
          await cartRepository.addItem(userCart.id, item.productId, finalQuantity, activePrice);
        }
      } catch (err) {
        console.error('Failed to merge guest cart item:', item, err);
      }
    }

    const updatedCart = await cartRepository.getCartByUserId(userId);
    return this.formatCartResponse(updatedCart);
  }
}

export const cartService = new CartService();

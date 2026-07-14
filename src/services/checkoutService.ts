import { cartRepository } from '@/repositories/cartRepository';
import { addressRepository } from '@/repositories/addressRepository';
import { productRepository } from '@/repositories/productRepository';

export class CheckoutService {
  async validateCheckout(userId: string, addressId: string) {
    // 1. Get user cart
    const cart: any = await cartRepository.getCartByUserId(userId);
    if (!cart || !cart.items || cart.items.length === 0) {
      return {
        success: false,
        message: 'Cart is empty. Cannot proceed to checkout.',
      };
    }

    // 2. Validate selected address
    const address = await addressRepository.getAddressById(addressId, userId);
    if (!address) {
      return {
        success: false,
        message: 'Please select a valid delivery address.',
      };
    }

    // 3. Revalidate stock & verify price consistency for every item
    const unavailableItems = [];
    for (const item of cart.items) {
      const product = await productRepository.findById(item.productId);
      if (!product) {
        unavailableItems.push({
          productId: item.productId,
          name: item.product.name,
          reason: 'Product no longer exists',
          availableStock: 0,
          requestedQuantity: item.quantity,
        });
        continue;
      }

      // Check stock
      if (product.stock <= 0 || item.quantity > product.stock) {
        unavailableItems.push({
          productId: item.productId,
          name: product.name,
          reason: product.stock <= 0 ? 'Out of stock' : 'Insufficient stock',
          availableStock: product.stock,
          requestedQuantity: item.quantity,
        });
        continue;
      }

      // Check price changes since addition
      const currentActivePrice = product.discountPrice !== null && product.discountPrice !== undefined
        ? product.discountPrice
        : product.price;

      if (currentActivePrice !== item.priceAtAddition) {
        return {
          success: false,
          error: 'PRICE_CHANGED',
          message: `The price of ${product.name} has changed from ₹${item.priceAtAddition} to ₹${currentActivePrice}. Please update your cart.`,
        };
      }
    }

    if (unavailableItems.length > 0) {
      return {
        success: false,
        message: 'Some products are unavailable',
        unavailableItems,
      };
    }

    // 4. Calculate final checkout totals
    let itemCount = 0;
    let originalSubtotal = 0;
    let totalDiscount = 0;

    const formattedCartItems = cart.items.map((item: any) => {
      itemCount += item.quantity;
      originalSubtotal += item.product.price * item.quantity;
      const activePrice = item.product.discountPrice !== null && item.product.discountPrice !== undefined
        ? item.product.discountPrice
        : item.product.price;
      totalDiscount += (item.product.price - activePrice) * item.quantity;

      return {
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        priceAtAddition: item.priceAtAddition,
        product: {
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          discountPrice: item.product.discountPrice,
          image: item.product.image,
          unit: item.product.unit,
        },
      };
    });

    const netSubtotal = originalSubtotal - totalDiscount;
    const deliveryFee = netSubtotal > 499 || netSubtotal === 0 ? 0 : 40;
    const gst = Math.round(netSubtotal * 0.05);
    const grandTotal = netSubtotal + deliveryFee + gst;

    return {
      success: true,
      data: {
        address: {
          id: address.id,
          fullName: address.fullName,
          phone: address.phone,
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2,
          landmark: address.landmark,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: address.country,
          addressType: address.addressType,
        },
        cart: {
          id: cart.id,
          items: formattedCartItems,
        },
        summary: {
          itemCount,
          subtotal: originalSubtotal,
          discount: totalDiscount,
          deliveryFee,
          gst,
          grandTotal,
        },
        readyForPayment: true,
      },
    };
  }
}

export const checkoutService = new CheckoutService();

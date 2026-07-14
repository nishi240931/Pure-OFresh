import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, Coupon, mockProducts, mockCoupons } from '@/lib/mockData';

export interface CartItem {
  id?: string;
  product: Product;
  quantity: number;
}

export interface UserAddress {
  id: string;
  title: string;
  name: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  orderNumber?: string;
  createdAt: string;
  status: 'PLACED' | 'PROCESSING' | 'PACKING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  paymentMethod: 'RAZORPAY' | 'COD';
  address: UserAddress;
  deliverySlot: string;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  total: number;
  items: OrderItem[];
  couponCode?: string;
}

export const mapDbOrderToFrontendOrder = (ord: any): Order => ({
  id: ord.id,
  orderNumber: ord.orderNumber,
  createdAt: ord.createdAt,
  status: ord.orderStatus === 'PENDING' ? 'PLACED' :
          ord.orderStatus === 'CONFIRMED' ? 'PROCESSING' :
          ord.orderStatus === 'PACKED' ? 'PACKING' :
          ord.orderStatus === 'OUT_FOR_DELIVERY' ? 'SHIPPED' :
          ord.orderStatus === 'DELIVERED' ? 'DELIVERED' : 'CANCELLED',
  paymentStatus: ord.paymentStatus,
  paymentMethod: ord.paymentMethod,
  deliverySlot: ord.deliverySlot || 'Morning (8:00 AM - 11:00 AM)',
  couponCode: ord.couponCode || undefined,
  subtotal: ord.subtotal,
  deliveryFee: ord.deliveryFee,
  tax: ord.gst,
  discount: ord.discount + ord.couponDiscount,
  total: ord.grandTotal,
  address: {
    id: ord.address.id,
    title: ord.address.addressType,
    name: ord.address.fullName,
    phone: ord.address.phone,
    streetAddress: ord.address.addressLine1 + (ord.address.addressLine2 ? ', ' + ord.address.addressLine2 : '') + (ord.address.landmark ? ', ' + ord.address.landmark : ''),
    city: ord.address.city,
    state: ord.address.state,
    zipCode: ord.address.postalCode,
    isDefault: ord.address.isDefault,
  },
  items: ord.items.map((item: any) => ({
    id: item.id,
    productId: item.productId,
    productName: item.productName,
    productImage: item.productImage,
    quantity: item.quantity,
    price: item.unitPrice,
  })),
});

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  role: 'USER' | 'ADMIN';
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface AppState {
  // Authentication & Profile State
  user: UserProfile | null;
  addresses: UserAddress[];
  orders: Order[];
  notifications: SystemNotification[];
  login: (email: string, name: string) => void;
  logout: () => void;
  register: (email: string, name: string, phone: string) => void;
  addAddress: (address: Omit<UserAddress, 'id'>) => void;
  updateAddress: (id: string, address: Partial<UserAddress>) => void;
  deleteAddress: (id: string) => void;
  placeOrder: (orderData: Omit<Order, 'id' | 'createdAt' | 'status' | 'paymentStatus'>) => Order;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  addNotification: (title: string, message: string) => void;
  markNotificationsAsRead: () => void;
  clearNotifications: () => void;

  // Cart State
  cart: CartItem[];
  coupon: Coupon | null;
  couponError: string | null;
  cartSummary: {
    totalItems: number;
    subtotal: number;
    deliveryFee: number;
    gst: number;
    grandTotal: number;
  } | null;
  cartLoading: boolean;
  isSignedIn: boolean;
  setSignedIn: (signedIn: boolean) => void;
  fetchCartFromDb: () => Promise<void>;
  mergeCartWithDb: (guestItems: { productId: string; quantity: number }[]) => Promise<void>;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  getCartSubtotal: () => number;
  getCartDiscount: () => number;
  getCartTax: () => number;
  getCartTotal: () => number;
  getCartCount: () => number;

  // Wishlist State
  wishlist: string[]; // array of product IDs
  toggleWishlist: (productId: string) => void;
  inWishlist: (productId: string) => boolean;

  // Admin Products state (to simulate adding/editing/deleting products in client)
  adminProducts: Product[];
  categories: any[];
  catalogLoading: boolean;
  catalogError: string | null;
  fetchCatalog: () => Promise<void>;
  addAdminProduct: (product: any) => Promise<void>;
  updateAdminProduct: (id: string, product: any) => Promise<void>;
  deleteAdminProduct: (id: string) => Promise<void>;
  resetCatalog: () => void;

  // Checkout & Address State
  checkoutSummary: any;
  addressLoading: boolean;
  addressError: string | null;
  fetchAddresses: () => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
  validateCheckoutOnServer: (addressId: string) => Promise<any>;

  // Order Actions
  fetchOrders: (sort?: 'newest' | 'oldest') => Promise<void>;
  placeOrderOnServer: (orderData: { addressId: string; paymentMethod: 'COD' | 'RAZORPAY'; deliverySlot?: string; notes?: string }) => Promise<any>;
  cancelOrderOnServer: (orderId: string) => Promise<any>;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Authentication & Profile Initial State
      user: {
        name: 'Nishitha Reddy',
        email: 'nishitha@pureofresh.com',
        phone: '+91 98765 43210',
        role: 'ADMIN' // Default to Admin so they can test both User & Admin flows easily!
      },
      addresses: [
        {
          id: 'addr-1',
          title: 'Home',
          name: 'Nishitha Reddy',
          phone: '+91 98765 43210',
          streetAddress: 'Flat 402, Green Meadows Apartment, Sarjapur Road',
          city: 'Bengaluru',
          state: 'Karnataka',
          zipCode: '560035',
          isDefault: true
        },
        {
          id: 'addr-2',
          title: 'Office',
          name: 'Nishitha Reddy',
          phone: '+91 98765 00000',
          streetAddress: 'Building 5B, 8th Floor, Global Tech Village',
          city: 'Bengaluru',
          state: 'Karnataka',
          zipCode: '560059',
          isDefault: false
        }
      ],
      orders: [
        {
          id: 'POF-9821-392',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
          status: 'DELIVERED',
          paymentStatus: 'PAID',
          paymentMethod: 'RAZORPAY',
          address: {
            id: 'addr-1',
            title: 'Home',
            name: 'Nishitha Reddy',
            phone: '+91 98765 43210',
            streetAddress: 'Flat 402, Green Meadows Apartment, Sarjapur Road',
            city: 'Bengaluru',
            state: 'Karnataka',
            zipCode: '560035',
            isDefault: true
          },
          deliverySlot: 'Morning (8:00 AM - 11:00 AM)',
          subtotal: 496,
          deliveryFee: 49,
          tax: 22,
          discount: 50,
          total: 517,
          items: [
            {
              id: 'oi-1',
              productId: 'prod-1',
              productName: 'Organic Gala Apples',
              productImage: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop&q=80',
              quantity: 2,
              price: 199
            },
            {
              id: 'oi-2',
              productId: 'prod-2',
              productName: 'Fresh Baby Spinach',
              productImage: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop&q=80',
              quantity: 2,
              price: 49
            }
          ]
        }
      ],
      notifications: [
        {
          id: 'notif-1',
          title: 'Welcome to Pure O Fresh!',
          message: 'Thank you for choosing Pure O Fresh. Enjoy 20% off on your first order using code FRESH20.',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          read: true
        },
        {
          id: 'notif-2',
          title: 'Order Delivered Successfully 🎉',
          message: 'Your order POF-9821-392 was delivered successfully. Let us know how you liked it!',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
          read: false
        }
      ],

      login: (email, name) => {
        set({
          user: {
            name,
            email,
            phone: '+91 99999 88888',
            role: email.includes('admin') ? 'ADMIN' : 'USER'
          }
        });
        get().addNotification('Logged In Successfully', `Welcome back, ${name}!`);
      },
      logout: () => {
        set({ user: null, orders: [], cart: [], wishlist: [] });
      },
      register: (email, name, phone) => {
        set({
          user: {
            name,
            email,
            phone,
            role: 'USER'
          }
        });
        get().addNotification('Account Created!', `Welcome to the Pure O Fresh family, ${name}!`);
      },

      fetchAddresses: async () => {
        if (!get().isSignedIn) return;
        set({ addressLoading: true, addressError: null });
        try {
          const res = await fetch('/api/addresses').then((r) => r.json());
          if (res.success && res.data) {
            const mapped = res.data.map((addr: any) => ({
              id: addr.id,
              title: addr.addressType,
              name: addr.fullName,
              phone: addr.phone,
              streetAddress: addr.addressLine1 + (addr.addressLine2 ? ', ' + addr.addressLine2 : '') + (addr.landmark ? ', ' + addr.landmark : ''),
              city: addr.city,
              state: addr.state,
              zipCode: addr.postalCode,
              isDefault: addr.isDefault,
            }));
            set({ addresses: mapped });
          }
        } catch (err: any) {
          console.error('Failed to fetch addresses:', err);
          set({ addressError: err.message || 'Failed to fetch addresses.' });
        } finally {
          set({ addressLoading: false });
        }
      },

      addAddress: async (address) => {
        if (get().isSignedIn) {
          set({ addressLoading: true, addressError: null });
          try {
            const payload = {
              fullName: address.name,
              phone: address.phone,
              addressLine1: address.streetAddress,
              addressLine2: '',
              landmark: '',
              city: address.city,
              state: address.state,
              postalCode: address.zipCode,
              addressType: ['HOME', 'WORK', 'OTHER'].includes(address.title.toUpperCase())
                ? address.title.toUpperCase()
                : 'HOME',
              isDefault: !!address.isDefault,
            };
            const res = await fetch('/api/addresses', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            }).then((r) => r.json());

            if (res.success) {
              await get().fetchAddresses();
              get().addNotification('Address Added 📍', 'New delivery address saved successfully.');
            } else {
              throw new Error(res.message || 'Failed to add address.');
            }
          } catch (err: any) {
            console.error(err);
            get().addNotification('Error ❌', err.message || 'Failed to add address.');
          } finally {
            set({ addressLoading: false });
          }
        } else {
          const id = 'addr-' + Math.random().toString(36).substr(2, 9);
          const newAddressList = get().addresses.map((a) =>
            address.isDefault ? { ...a, isDefault: false } : a
          );
          set({
            addresses: [...newAddressList, { ...address, id }]
          });
          get().addNotification('Address Added 📍', 'New delivery address saved.');
        }
      },

      updateAddress: async (id, updatedFields) => {
        if (get().isSignedIn) {
          set({ addressLoading: true, addressError: null });
          try {
            const payload: any = {};
            if (updatedFields.name) payload.fullName = updatedFields.name;
            if (updatedFields.phone) payload.phone = updatedFields.phone;
            if (updatedFields.streetAddress) payload.addressLine1 = updatedFields.streetAddress;
            if (updatedFields.city) payload.city = updatedFields.city;
            if (updatedFields.state) payload.state = updatedFields.state;
            if (updatedFields.zipCode) payload.postalCode = updatedFields.zipCode;
            if (updatedFields.title) {
              payload.addressType = ['HOME', 'WORK', 'OTHER'].includes(updatedFields.title.toUpperCase())
                ? updatedFields.title.toUpperCase()
                : 'HOME';
            }
            if (updatedFields.isDefault !== undefined) payload.isDefault = updatedFields.isDefault;

            const res = await fetch(`/api/addresses/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            }).then((r) => r.json());

            if (res.success) {
              await get().fetchAddresses();
              get().addNotification('Address Updated', 'Delivery address settings saved.');
            } else {
              throw new Error(res.message || 'Failed to update address.');
            }
          } catch (err: any) {
            console.error(err);
            get().addNotification('Error ❌', err.message || 'Failed to update address.');
          } finally {
            set({ addressLoading: false });
          }
        } else {
          let currentAddresses = get().addresses;
          if (updatedFields.isDefault) {
            currentAddresses = currentAddresses.map((a) => ({ ...a, isDefault: false }));
          }
          set({
            addresses: currentAddresses.map((a) => (a.id === id ? { ...a, ...updatedFields } : a))
          });
        }
      },

      deleteAddress: async (id) => {
        if (get().isSignedIn) {
          set({ addressLoading: true, addressError: null });
          try {
            const res = await fetch(`/api/addresses/${id}`, {
              method: 'DELETE',
            }).then((r) => r.json());

            if (res.success) {
              await get().fetchAddresses();
              get().addNotification('Address Deleted 🗑️', 'Delivery address removed.');
            } else {
              throw new Error(res.message || 'Failed to delete address.');
            }
          } catch (err: any) {
            console.error(err);
            get().addNotification('Error ❌', err.message || 'Failed to delete address.');
          } finally {
            set({ addressLoading: false });
          }
        } else {
          set({
            addresses: get().addresses.filter((a) => a.id !== id)
          });
        }
      },

      setDefaultAddress: async (id) => {
        if (get().isSignedIn) {
          set({ addressLoading: true, addressError: null });
          try {
            const res = await fetch(`/api/addresses/${id}/default`, {
              method: 'PATCH',
            }).then((r) => r.json());

            if (res.success) {
              await get().fetchAddresses();
              get().addNotification('Default Address Set 📍', 'Updated default shipping preference.');
            } else {
              throw new Error(res.message || 'Failed to set default address.');
            }
          } catch (err: any) {
            console.error(err);
            get().addNotification('Error ❌', err.message || 'Failed to update default address.');
          } finally {
            set({ addressLoading: false });
          }
        } else {
          set({
            addresses: get().addresses.map((a) => ({
              ...a,
              isDefault: a.id === id,
            })),
          });
        }
      },

      validateCheckoutOnServer: async (addressId) => {
        if (!get().isSignedIn) return { success: false, message: 'Must be logged in.' };
        set({ cartLoading: true });
        try {
          const res = await fetch('/api/checkout/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ addressId }),
          }).then((r) => r.json());

          if (res.success && res.data) {
            set({ checkoutSummary: res.data });
          } else {
            set({ checkoutSummary: null });
          }
          return res;
        } catch (err: any) {
          console.error('Failed to validate checkout:', err);
          set({ checkoutSummary: null });
          return { success: false, message: err.message || 'Checkout validation failed.' };
        } finally {
          set({ cartLoading: false });
        }
      },

      placeOrder: (orderData) => {
        const id = 'POF-' + Math.floor(1000 + Math.random() * 9000) + '-' + Math.floor(100 + Math.random() * 900);
        const newOrder: Order = {
          ...orderData,
          id,
          createdAt: new Date().toISOString(),
          status: 'PLACED',
          paymentStatus: orderData.paymentMethod === 'RAZORPAY' ? 'PAID' : 'PENDING'
        };

        set({
          orders: [newOrder, ...get().orders],
          cart: [], // Clear cart
          coupon: null // Clear coupon
        });

        get().addNotification(
          'Order Placed Successfully! 🛒',
          `Your order ${id} for ₹${Math.round(newOrder.total).toLocaleString('en-IN')} has been registered.`
        );

        // Simulation: Advance status automatically for premium user experience demonstration!
        setTimeout(() => {
          get().updateOrderStatus(id, 'PROCESSING');
          get().addNotification('Order Processing', `Pure O Fresh has accepted your order ${id}.`);
        }, 15000);

        setTimeout(() => {
          get().updateOrderStatus(id, 'PACKING');
          get().addNotification('Packing Items 📦', `Our experts are hand-picking fresh items for order ${id}.`);
        }, 40000);

        setTimeout(() => {
          get().updateOrderStatus(id, 'SHIPPED');
          get().addNotification('Out for Delivery 🚀', `Your order ${id} is out for delivery with our partner.`);
        }, 70000);

        setTimeout(() => {
          get().updateOrderStatus(id, 'DELIVERED');
          get().addNotification('Order Delivered ✅', `Order ${id} has been delivered to your doorstep. Freshness served!`);
        }, 100000);

        return newOrder;
      },

      updateOrderStatus: (orderId, status) => {
        set({
          orders: get().orders.map((o) => (o.id === orderId ? { ...o, status } : o))
        });
      },

      addNotification: (title, message) => {
        const id = 'notif-' + Math.random().toString(36).substr(2, 9);
        const newNotif: SystemNotification = {
          id,
          title,
          message,
          timestamp: new Date().toISOString(),
          read: false
        };
        set({
          notifications: [newNotif, ...get().notifications].slice(0, 20) // cap at 20
        });
      },

      markNotificationsAsRead: () => {
        set({
          notifications: get().notifications.map((n) => ({ ...n, read: true }))
        });
      },

      clearNotifications: () => {
        set({ notifications: [] });
      },

      // Cart Actions
      cart: [],
      coupon: null,
      couponError: null,
      cartSummary: null,
      cartLoading: false,
      isSignedIn: false,
      checkoutSummary: null,
      addressLoading: false,
      addressError: null,

      setSignedIn: (signedIn) => set({ isSignedIn: signedIn }),

      fetchCartFromDb: async () => {
        if (!get().isSignedIn) return;
        set({ cartLoading: true });
        try {
          const res = await fetch('/api/cart').then((r) => r.json());
          if (res.success && res.data) {
            set({
              cart: res.data.cart.items.map((item: any) => ({
                id: item.id,
                product: item.product,
                quantity: item.quantity,
              })),
              cartSummary: res.data.summary,
            });
          }
          // Fetch addresses on profile load/cart sync
          await get().fetchAddresses();
        } catch (err) {
          console.error('Failed to fetch db cart:', err);
        } finally {
          set({ cartLoading: false });
        }
      },

      mergeCartWithDb: async (guestItems) => {
        if (!get().isSignedIn) return;
        set({ cartLoading: true });
        try {
          const res = await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ guestItems }),
          }).then((r) => r.json());

          if (res.success && res.data) {
            set({
              cart: res.data.cart.items.map((item: any) => ({
                id: item.id,
                product: item.product,
                quantity: item.quantity,
              })),
              cartSummary: res.data.summary,
            });
            // Clear local guest cart after successful merge
            set({ cart: [] });
          }
        } catch (err) {
          console.error('Failed to merge guest cart:', err);
        } finally {
          set({ cartLoading: false });
        }
      },

      addToCart: async (product, quantity = 1) => {
        if (get().isSignedIn) {
          set({ cartLoading: true });
          try {
            const res = await fetch('/api/cart', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ productId: product.id, quantity }),
            }).then((r) => r.json());

            if (res.success && res.data) {
              set({
                cart: res.data.cart.items.map((item: any) => ({
                  id: item.id,
                  product: item.product,
                  quantity: item.quantity,
                })),
                cartSummary: res.data.summary,
              });
              get().addNotification('Added to Cart 🛒', `${product.name} (${quantity} unit(s)) added.`);
            } else if (res.error === 'OUT_OF_STOCK') {
              get().addNotification('Stock Limit Reached ⚠️', res.message || 'Cannot add more than available stock.');
            }
          } catch (err) {
            console.error('Failed to add to db cart:', err);
          } finally {
            set({ cartLoading: false });
          }
        } else {
          // Guest Cart: Local Storage fallback
          const cart = get().cart;
          const existing = cart.find((item) => item.product.id === product.id);
          const currentQty = existing?.quantity || 0;
          
          if (product.stock <= 0) {
            get().addNotification('Out of Stock ⚠️', `${product.name} is currently out of stock.`);
            return;
          }
          if (currentQty + quantity > product.stock) {
            get().addNotification('Stock Limit Reached ⚠️', `Cannot add more than available stock (${product.stock} items).`);
            return;
          }

          if (existing) {
            set({
              cart: cart.map((item) =>
                item.product.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
              cartSummary: null,
            });
          } else {
            set({
              cart: [...cart, { product, quantity }],
              cartSummary: null,
            });
          }
          get().addNotification('Added to Cart 🛒', `${product.name} (${quantity} unit(s)) added.`);
        }
      },

      removeFromCart: async (productId) => {
        if (get().isSignedIn) {
          // Find database item ID mapping
          const cart = get().cart;
          const item = cart.find((i) => i.product.id === productId);
          if (!item || !item.id) return;

          set({ cartLoading: true });
          try {
            const res = await fetch(`/api/cart/items/${item.id}`, {
              method: 'DELETE',
            }).then((r) => r.json());

            if (res.success && res.data) {
              set({
                cart: res.data.cart.items.map((item: any) => ({
                  id: item.id,
                  product: item.product,
                  quantity: item.quantity,
                })),
                cartSummary: res.data.summary,
              });
              get().addNotification('Removed from Cart', `${item.product.name} removed from your cart.`);
            }
          } catch (err) {
            console.error('Failed to remove from db cart:', err);
          } finally {
            set({ cartLoading: false });
          }
        } else {
          const cart = get().cart;
          const item = cart.find((i) => i.product.id === productId);
          if (item) {
            set({
              cart: cart.filter((i) => i.product.id !== productId),
              cartSummary: null,
            });
            get().addNotification('Removed from Cart', `${item.product.name} removed from your cart.`);
          }
        }
      },

      updateQuantity: async (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }

        if (get().isSignedIn) {
          const cart = get().cart;
          const item = cart.find((i) => i.product.id === productId);
          if (!item || !item.id) return;

          set({ cartLoading: true });
          try {
            const res = await fetch(`/api/cart/items/${item.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ quantity }),
            }).then((r) => r.json());

            if (res.success && res.data) {
              set({
                cart: res.data.cart.items.map((item: any) => ({
                  id: item.id,
                  product: item.product,
                  quantity: item.quantity,
                })),
                cartSummary: res.data.summary,
              });
            } else if (res.error === 'OUT_OF_STOCK') {
              get().addNotification('Stock Limit Reached ⚠️', res.message || 'Cannot exceed available stock.');
            }
          } catch (err) {
            console.error('Failed to update db cart quantity:', err);
          } finally {
            set({ cartLoading: false });
          }
        } else {
          const cart = get().cart;
          const item = cart.find((i) => i.product.id === productId);
          if (item && quantity > item.product.stock) {
            get().addNotification('Stock Limit Reached ⚠️', `Cannot exceed available stock (${item.product.stock} items).`);
            return;
          }
          set({
            cart: get().cart.map((item) =>
              item.product.id === productId ? { ...item, quantity } : item
            ),
            cartSummary: null,
          });
        }
      },

      clearCart: async () => {
        if (get().isSignedIn) {
          set({ cartLoading: true });
          try {
            const res = await fetch('/api/cart', {
              method: 'DELETE',
            }).then((r) => r.json());

            if (res.success) {
              set({
                cart: [],
                cartSummary: null,
                coupon: null,
              });
            }
          } catch (err) {
            console.error('Failed to clear db cart:', err);
          } finally {
            set({ cartLoading: false });
          }
        } else {
          set({ cart: [], coupon: null, cartSummary: null });
        }
      },

      applyCoupon: (code) => {
        const found = mockCoupons.find((c) => c.code.toUpperCase() === code.toUpperCase());
        const subtotal = get().getCartSubtotal();

        if (!found) {
          set({ couponError: 'Invalid coupon code.' });
          return false;
        }

        if (subtotal < found.minPurchase) {
          set({ couponError: `Minimum purchase of ₹${found.minPurchase} required for this coupon.` });
          return false;
        }

        set({ coupon: found, couponError: null });
        get().addNotification('Coupon Applied 🏷️', `Discount code ${found.code} applied successfully.`);
        return true;
      },

      removeCoupon: () => set({ coupon: null, couponError: null }),

      getCartSubtotal: () => {
        const summary = get().cartSummary;
        if (summary) return summary.subtotal;

        return get().cart.reduce((sum, item) => {
          const discountPrice = item.product.discountPrice !== null && item.product.discountPrice !== undefined
            ? item.product.discountPrice
            : item.product.price;
          return sum + discountPrice * item.quantity;
        }, 0);
      },

      getCartDiscount: () => {
        const subtotal = get().getCartSubtotal();
        const coupon = get().coupon;
        if (!coupon) return 0;

        if (coupon.discountType === 'PERCENTAGE') {
          return subtotal * (coupon.discount / 100);
        } else {
          return Math.min(coupon.discount, subtotal);
        }
      },

      getCartTax: () => {
        const summary = get().cartSummary;
        if (summary) return summary.gst;

        const subtotal = get().getCartSubtotal();
        const discount = get().getCartDiscount();
        return (subtotal - discount) * 0.05;
      },

      getCartTotal: () => {
        const summary = get().cartSummary;
        if (summary) return summary.grandTotal;

        const subtotal = get().getCartSubtotal();
        const discount = get().getCartDiscount();
        const tax = get().getCartTax();
        const deliveryFee = subtotal > 499 || subtotal === 0 ? 0 : 49;
        return Math.max(0, subtotal - discount + tax + deliveryFee);
      },

      getCartCount: () => {
        const summary = get().cartSummary;
        if (summary) return summary.totalItems;
        return get().cart.reduce((sum, item) => sum + item.quantity, 0);
      },

      // Wishlist State
      wishlist: [],
      toggleWishlist: (productId) => {
        const wishlist = get().wishlist;
        const exists = wishlist.includes(productId);
        const prod = get().adminProducts.find((p) => p.id === productId);

        if (exists) {
          set({ wishlist: wishlist.filter((id) => id !== productId) });
          if (prod) get().addNotification('Removed from Wishlist ❤️', `${prod.name} removed.`);
        } else {
          set({ wishlist: [...wishlist, productId] });
          if (prod) get().addNotification('Added to Wishlist ❤️', `${prod.name} added.`);
        }
      },
      inWishlist: (productId) => get().wishlist.includes(productId),

      // Admin Products state
      adminProducts: mockProducts,
      categories: [],
      catalogLoading: false,
      catalogError: null,

      fetchCatalog: async () => {
        set({ catalogLoading: true, catalogError: null });
        try {
          const [resProducts, resCategories] = await Promise.all([
            fetch('/api/products').then((r) => r.json()),
            fetch('/api/categories').then((r) => r.json()),
          ]);

          if (resProducts.success && resCategories.success) {
            const productsList = resProducts.products || resProducts.data || [];
            const productsWithDiscount = productsList.map((p: any) => {
              const discount = p.discountPrice
                ? Math.round(((p.price - p.discountPrice) / p.price) * 100)
                : 0;
              return { ...p, discount };
            });
            set({
              adminProducts: productsWithDiscount,
              categories: resCategories.categories,
              catalogLoading: false,
            });
          } else {
            set({
              catalogError: resProducts.error || resCategories.error || 'Failed to fetch catalog.',
              catalogLoading: false,
            });
          }
        } catch (error: any) {
          set({
            catalogError: error.message || 'Network error occurred while fetching catalog.',
            catalogLoading: false,
          });
        }
      },

      addAdminProduct: async (product) => {
        try {
          const res = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product),
          }).then((r) => r.json());

          if (res.success) {
            const productWithDiscount = {
              ...res.product,
              discount: res.product.discountPrice
                ? Math.round(((res.product.price - res.product.discountPrice) / res.product.price) * 100)
                : 0,
            };
            set({
              adminProducts: [...get().adminProducts, productWithDiscount],
            });
            get().addNotification('Product Added 🌾', `${res.product.name} is now available in inventory.`);
          } else {
            throw new Error(res.error || 'Failed to create product.');
          }
        } catch (error: any) {
          console.error(error);
          get().addNotification('Error ❌', error.message || 'Failed to add product.');
        }
      },

      updateAdminProduct: async (id, updatedFields) => {
        try {
          const res = await fetch(`/api/products/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedFields),
          }).then((r) => r.json());

          if (res.success) {
            const productWithDiscount = {
              ...res.product,
              discount: res.product.discountPrice
                ? Math.round(((res.product.price - res.product.discountPrice) / res.product.price) * 100)
                : 0,
            };
            set({
              adminProducts: get().adminProducts.map((p) => (p.id === id ? productWithDiscount : p)),
            });
            get().addNotification('Product Updated', `Product settings saved.`);
          } else {
            throw new Error(res.error || 'Failed to update product.');
          }
        } catch (error: any) {
          console.error(error);
          get().addNotification('Error ❌', error.message || 'Failed to update product.');
        }
      },

      deleteAdminProduct: async (id) => {
        try {
          const res = await fetch(`/api/products/${id}`, {
            method: 'DELETE',
          }).then((r) => r.json());

          if (res.success) {
            const prod = get().adminProducts.find((p) => p.id === id);
            set({
              adminProducts: get().adminProducts.filter((p) => p.id !== id),
              wishlist: get().wishlist.filter((wid) => wid !== id),
              cart: get().cart.filter((item) => item.product.id !== id),
            });
            if (prod) get().addNotification('Product Deleted 🗑️', `${prod.name} removed from inventory.`);
          } else {
            throw new Error(res.error || 'Failed to delete product.');
          }
        } catch (error: any) {
          console.error(error);
          get().addNotification('Error ❌', error.message || 'Failed to delete product.');
        }
      },

      resetCatalog: () => {
        set({ adminProducts: mockProducts });
      },

      fetchOrders: async (sort = 'newest') => {
        if (!get().isSignedIn) return;
        try {
          const res = await fetch(`/api/orders?sort=${sort}`).then((r) => r.json());
          if (res.success && res.data) {
            const mapped = res.data.map(mapDbOrderToFrontendOrder);
            set({ orders: mapped });
          }
        } catch (err) {
          console.error('Failed to fetch orders:', err);
        }
      },

      placeOrderOnServer: async (orderData) => {
        if (!get().isSignedIn) return { success: false, message: 'Must be logged in.' };
        set({ cartLoading: true });
        try {
          const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData),
          }).then((r) => r.json());

          if (res.success && res.data) {
            // Clear local cart
            set({ cart: [], cartSummary: null, coupon: null, checkoutSummary: null });
            get().addNotification('Order Placed! 🛒', `Order ${res.data.orderNumber} placed successfully.`);
            // Refresh orders
            await get().fetchOrders();
          }
          return res;
        } catch (err: any) {
          console.error('Failed to place order:', err);
          return { success: false, message: err.message || 'Failed to place order.' };
        } finally {
          set({ cartLoading: false });
        }
      },

      cancelOrderOnServer: async (orderId) => {
        if (!get().isSignedIn) return { success: false, message: 'Must be logged in.' };
        set({ cartLoading: true });
        try {
          const res = await fetch(`/api/orders/${orderId}/cancel`, {
            method: 'PATCH',
          }).then((r) => r.json());

          if (res.success) {
            get().addNotification('Order Cancelled 🗑️', 'Your order was cancelled successfully.');
            await get().fetchOrders();
          }
          return res;
        } catch (err: any) {
          console.error('Failed to cancel order:', err);
          return { success: false, message: err.message || 'Failed to cancel order.' };
        } finally {
          set({ cartLoading: false });
        }
      }
    }),
    {
      name: 'pure-o-fresh-storage',
      partialize: (state) => ({
        user: state.user,
        addresses: state.addresses,
        orders: state.orders,
        notifications: state.notifications,
        cart: state.cart,
        coupon: state.coupon,
        wishlist: state.wishlist,
        adminProducts: state.adminProducts
      })
    }
  )
);

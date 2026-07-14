'use client';

import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { useUser } from '@clerk/nextjs';

export default function CatalogInitializer() {
  const fetchCatalog = useStore((state) => state.fetchCatalog);
  const setSignedIn = useStore((state) => state.setSignedIn);
  const fetchCartFromDb = useStore((state) => state.fetchCartFromDb);
  const mergeCartWithDb = useStore((state) => state.mergeCartWithDb);
  const fetchOrders = useStore((state) => state.fetchOrders);

  const { isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    fetchCatalog().catch((err) => {
      console.error('Failed to initialize product catalog:', err);
    });
  }, [fetchCatalog]);

  // Sync authentication and trigger cart fetch/merge & orders history load
  useEffect(() => {
    if (!isLoaded) return;

    setSignedIn(isSignedIn || false);

    if (isSignedIn) {
      const currentCart = useStore.getState().cart;
      if (currentCart.length > 0) {
        const guestItems = currentCart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        }));
        mergeCartWithDb(guestItems).catch((err) => {
          console.error('Failed to merge guest cart:', err);
        });
      } else {
        fetchCartFromDb().catch((err) => {
          console.error('Failed to fetch user cart:', err);
        });
      }
      
      // Fetch user orders history
      fetchOrders().catch((err) => {
        console.error('Failed to fetch user orders:', err);
      });
    }
  }, [isSignedIn, isLoaded, setSignedIn, fetchCartFromDb, mergeCartWithDb, fetchOrders]);

  return null;
}

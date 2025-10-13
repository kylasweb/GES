'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WishlistItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  image: string;
  category: string;
  inStock: boolean;
  addedDate: string;
}

interface WishlistStore {
  items: WishlistItem[];
  addItem: (item: Omit<WishlistItem, 'addedDate'>) => void;
  removeItem: (id: string) => void;
  clearWishlist: () => void;
  isInWishlist: (id: string) => boolean;
  getWishlistCount: () => number;
}

export const useWishlist = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => {
        set((state) => {
          const existingItem = state.items.find((item) => item.id === newItem.id);

          if (existingItem) {
            return state; // Item already in wishlist
          }

          return {
            items: [...state.items, { ...newItem, addedDate: new Date().toISOString() }],
          };
        });
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      clearWishlist: () => {
        set({ items: [] });
      },

      isInWishlist: (id) => {
        const { items } = get();
        return items.some((item) => item.id === id);
      },

      getWishlistCount: () => {
        const { items } = get();
        return items.length;
      },
    }),
    {
      name: 'wishlist-storage',
    }
  )
);

// Helper hooks for specific values
export const useWishlistItems = () => useWishlist((state) => state.items);
export const useWishlistCount = () => useWishlist((state) => state.getWishlistCount());
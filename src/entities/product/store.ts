import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from './model/types';

interface ProductStore {
  chosenProduct: Product | null;
  setChosenProduct: (product: Product | null) => void;
  clearChosenProduct: () => void;
}

export const useProductStore = create<ProductStore>()(
  persist(
    (set) => ({
      chosenProduct: null,
      setChosenProduct: (product) => {
        console.log('Setting chosen product:', product);
        set({ chosenProduct: product });
      },
      clearChosenProduct: () => {
        console.log('Clearing chosen product');
        set({ chosenProduct: null });
      },
    }),
    {
      name: 'product-store',
      // Add version to handle store migrations
      version: 1,
      migrate: (persistedState: any, version: number) => {
        // Handle migration from version 0 to 1
        if (version === 0) {
          // If migrating from version 0, just return the state as is
          return persistedState;
        }
        return persistedState;
      },
    }
  )
);

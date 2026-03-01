import { Product, CreateProductDto, Member } from '../model/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const generateMembers = (numMembers: number): Member[] => {
  const positions = [
    'Developer',
    'Designer',
    'Manager',
    'Tester',
    'Owner',
    'Support',
  ];

  const members: Member[] = [];
  for (let i = 0; i < numMembers; i++) {
    members.push({
      name: `Member ${i + 1}`,
      email: `member${i + 1}@example.com`,
      position: positions[getRandomInt(0, positions.length - 1)],
      isOwner: i === 0,
    });
  }
  return members;
};

// let nextId = 5;

export const productDB: Product[] = [
  {
    id: 1,
    name: 'Product 1',
    members: generateMembers(getRandomInt(10, 15)),
    materialLink: 'https://example.com/material-1',
    materialFiles: [],
  },
  {
    id: 2,
    name: 'Product 2',
    members: generateMembers(getRandomInt(10, 15)),
    materialLink: 'https://example.com/material-2',
    materialFiles: [],
  },
  {
    id: 3,
    name: 'Product 3',
    members: generateMembers(getRandomInt(10, 15)),
    materialLink: 'https://example.com/material-3',
    materialFiles: [],
  },
  {
    id: 4,
    name: 'Product 4',
    members: generateMembers(getRandomInt(10, 15)),
    materialLink: 'https://example.com/material-4',
    materialFiles: [],
  },
];

interface ProductStore {
  products: Product[];
  chosenProduct: Product | null;
  setProducts: (products: Product[]) => void;
  setChosenProduct: (product: Product) => void;
  addProduct: (data: CreateProductDto) => Product;
  updateProduct: (id: number, data: Partial<Product>) => void;
}

export const useProductStore = create<ProductStore>()(
  persist(
    (set) => ({
      products: productDB,
      chosenProduct: null,
      setProducts: (products) => set({ products }),
      setChosenProduct: (product) => set({ chosenProduct: product }),
      addProduct: (data) => {
        const newProduct: Product = { id: Date.now(), ...data };
        set((state) => ({ products: [...state.products, newProduct] }));
        return newProduct;
      },
      updateProduct: (id, data) => {
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, ...data } : p
          ),
        }));
      },
    }),
    {
      name: 'product-store',
    }
  )
);

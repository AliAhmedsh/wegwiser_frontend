import { Product } from '../model/types';

export const isFakeProduct = (productName: string): boolean => {
  const trimmedName = productName.trim();
  
  if (trimmedName.length <= 1) return true;
  if (/^[^a-zA-Z0-9\s]+$/.test(trimmedName)) return true;
  if (/^[a-z]{1,2}$/i.test(trimmedName)) return true;
  
  return false;
};

export const filterRealProducts = (products: Product[]): Product[] => {
  return products.filter(product => !isFakeProduct(product.name));
};

export const getValidProducts = (products: Product[]): Product[] => {
  return products.filter(product => {
    const name = product.name?.trim();
    return name && 
           name.length > 0 && 
           typeof name === 'string';
  });
};

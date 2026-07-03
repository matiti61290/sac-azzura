export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface User {
  id: number;
  firstname: string;
  lastname: string;
  mail?: string;
  isVerified: boolean;
}

export interface Category {
  id: number;
  name: string;
  sku_code: string
}

export interface SubCategory {
  id: number;
  name: string;
  categoryId: number;
  sku_code: string;
  category?: Category;
}

export interface Color {
  id: number;
  name: string;
  sku_code: string
}

export interface Material {
  id: number;
  name: string;
  sku_code: string
}

export interface ProductImage {
  id: number;
  key: string;
  url: string;
}

export interface ProductStock {
  id: number;
  quantity: number;
  sku: string;
  color: Color;
  material: Material;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  isActive: boolean;
  sku_code: string;
  subcategory: SubCategory; 
  images: ProductImage[];
  stocks: ProductStock[];
}
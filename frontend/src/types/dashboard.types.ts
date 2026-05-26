export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface User {
  id: number;
  lastname: string;
  mail?: string;
}

export interface Category {
  id: number;
  nom: string;
  description?: string;
}

export interface SubCategory {
  id: number;
  nom: string;
  description?: string;
}

export interface Color {
  id: number;
  code: string;
  nom?: string;
}

export interface Material {
  id: number;
  nom: string;
  description?: string;
}

export interface Product {
  id: number;
  nom: string;
  categorieId?: number;
  sousCategorieId?: number;
  couleurId?: number;
  materiaux?: number[];
  description?: string;
  prix?: number;
  quantiteStock?: number;
}
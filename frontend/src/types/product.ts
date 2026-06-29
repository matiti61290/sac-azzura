// types/product.ts

export interface ProductImage {
    id: number;
    key: string;
    url: string;
}

// On ajoute les interfaces pour les catégories
export interface Category {
    id: number;
    name: string;
    sku_code: string; // Identifier unique par la backend
    subcategories?: Category[]; // Relation pour afficher la structure hiérarchique
}

export interface SubCategory {
    id: number;
    name: string;
    sku_code: string;
    category: Category; // La relation vers le parent
}

export interface Color {
    id: number;
    name: string;
    sku_code: string
}

export interface Material {
    id: number;
    name: string;
    sku_code: string;
}

export interface Stocks {
    id: number;
    quantity: number;
    sku: string;
    color: Color;
    material: Material
}

export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    sku_code: string;
    isActive: boolean;
    images: ProductImage[];
    subcategory: SubCategory;
    stocks: Stocks[] 
}
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

export interface Product {
    id: number;
    name: string;
    description: string;
    price: string | number;
    sku_code: string;
    isActive: boolean;
    images: ProductImage[];
    
    // 👇 On ajoute la relation de ton back
    subcategory: SubCategory; 
}
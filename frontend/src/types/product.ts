// types/product.ts

export interface ProductImage {
    id: number;
    key: string;
    url: string;
}


export interface Category {
    id: number;
    name: string;
    sku_code: string;
    subcategories?: Category[];
}

export interface SubCategory {
    id: number;
    name: string;
    sku_code: string;
    category: Category;
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
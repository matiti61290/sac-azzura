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
  key: string;      // Le chemin S3 (ex: "products/12345_image.jpg")
  url: string;      // L'URL présignée temporaire renvoyée par ton AwsS3Service
}

export interface ProductStock {
  id: number;
  quantity: number;
  sku: string;      // Le SKU généré (Produit_Catégorie_SousCat_Couleur_Materiau)
  color: Color;     // L'objet Color complet renvoyé par la relation TypeORM
  material: Material; // L'objet Material complet renvoyé par la relation TypeORM
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  isActive: boolean;
  sku_code: string; // Le SKU de base du produit
  subcategory: SubCategory; 
  images: ProductImage[];
  stocks: ProductStock[];
}
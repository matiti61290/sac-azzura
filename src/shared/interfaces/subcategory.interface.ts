import { Category } from "./category.interface";
import { Product } from "./product.interface";

export interface Subcategory {
    id: number,
    subcategory: string,
    products: Product,
    category: Category
}
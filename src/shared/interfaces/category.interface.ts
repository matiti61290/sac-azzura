import { Subcategory } from "./subcategory.interface";

export interface Category {
    id: number,
    category: string,
    subcategory: Subcategory
}
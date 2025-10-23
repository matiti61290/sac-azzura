import { Color } from "./color.interface";
import { Material } from "./material.interface";
import { Product } from "./product.interface";

export interface Stock {
    id: number,
    product: Product,
    material: Material,
    color: Color,
    quantity: number,
    sku: string
}
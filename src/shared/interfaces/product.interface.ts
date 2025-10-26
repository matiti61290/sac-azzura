import { Order } from "./order.interface";
import { Stock } from "./stock.interface";
import { Subcategory } from "./subcategory.interface";

export interface Product {
    id: number,
    product: string,
    description: string,
    price: number,
    image_url: string,
    subcategory: Subcategory
    stock: Stock[]
    order: Order[]
}
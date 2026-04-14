import { Product } from "./product.interface";
import { Promotion } from "./promotion.interface";
import { User } from "./user.interface";

export interface Order {
    id: number,
    user: User,
    product: Product,
    promotion: Promotion,
    status: string
}
import { Stock } from "./stock.interface";

export interface Material {
    id: number,
    material: string,
    stock: Stock[]
}
import { Order } from "./order.interface"

export interface Promotion {
    id: number,
    code: string,
    type: string,
    valeur: number,
    stardate: Date,
    enddate: Date,
    condition: string,
    isActive: boolean
    order: Order
}
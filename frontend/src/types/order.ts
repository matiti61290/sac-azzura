import { OrderStatus } from "../libs/enum/order-status";


export interface Order {
    id: number;
    totalAmount: number;
    status: OrderStatus;
    createdAt: string;
}
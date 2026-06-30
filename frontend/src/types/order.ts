import { OrderStatus } from "../libs/enum/order-status";


export interface Order {
    id: number;
    totalAmount: number;
    status: OrderStatus; // Utilisation de l'enum au lieu de 'string'
    createdAt: string;
}
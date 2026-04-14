import { Adress } from "./address.interface";
import { Order } from "./order.interface";

export interface User {
    id: number,
    firstname: string,
    lastname: string,
    mail: string,
    phoneNumber: string,
    password: string,
    isVerified: boolean,
    addresses: Adress[],
    orders:Order[],
    isAdmin: boolean
}
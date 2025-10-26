import { Adress } from "./address.interface";
import { Order } from "./order.interface";

export interface User {
    id: number,
    firstname: string,
    lastname: string,
    mail: string,
    phone_number: number,
    password: string,
    is_verified: boolean,
    adresses: Adress,
    order:Order
}
import { User } from "./user.interface";

export interface Adress {
    id: number,
    street: string,
    additionnal: string,
    zipcode: number,
    city: string,
    user: User
}
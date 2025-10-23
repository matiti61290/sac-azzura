import { Adress } from "src/shared/interfaces/address.interface";
import { Order } from "src/shared/interfaces/order.interface";
import { User } from "src/shared/interfaces/user.interface";
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class UserEntity implements User{
    @PrimaryGeneratedColumn({ type: 'int' })
    id: number;

    @Column({ length: 255 })
    firstname: string;

    @Column({ length: 255})
    lastname: string;

    @Column({ length: 255 })
    mail: string;

    @Column({ type: 'int' })
    phone_number: number;

    @Column({ length: 255 })
    password: string;

    @Column()
    is_verified: boolean;

    addresses: Adress;

    order: Order;
}
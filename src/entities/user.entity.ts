import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Index } from "typeorm";
import { AddressEntity } from "./addresses.entity";
import { OrderEntity } from "./order.entity";

@Entity('User')
export class UserEntity {
    @PrimaryGeneratedColumn({ type: 'int' })
    id: number;

    @Column({ length: 255 })
    firstname: string;

    @Column({ length: 255})
    lastname: string;

    @Column({ length: 255, unique: true })
    mail: string;

    @Column({ length: 20 })
    phoneNumber: string;

    @Column({ length: 255 })
    password: string;

    @Column()
    isVerified: boolean;

    @OneToMany(
        ()=> AddressEntity, 
        (address)=> address.user, 
        { cascade: true, onDelete: "CASCADE" }
    )
    addresses: AddressEntity[];

    @OneToMany(()=> OrderEntity, (order)=> order.user)
    orders: OrderEntity[];

    @Column()
    isAdmin: boolean
}
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index, OneToMany } from "typeorm";
import { UserEntity } from "./user.entity";
import { AddressType } from "src/shared/enum/address.enum";
import { OrderEntity } from "./order.entity";

@Entity('Address')
export class AddressEntity {
    @PrimaryGeneratedColumn({ type: 'int' })
    id: number

    @Column({ type: "enum", enum: AddressType})
    type: AddressType
    
    @Column({ length: 255, nullable: false})
    street: string

    @Column({ length: 255 })
    additional: string

    @Column({ length: 20, nullable: false })
    zipcode: string;

    @Column({ length: 255, nullable: false})
    city: string;

    @ManyToOne(
        ()=> UserEntity, 
        (user)=>user.addresses, 
        {onDelete: "CASCADE"}
    )
    @Index()
    user: UserEntity;

    @OneToMany(()=> OrderEntity, (order)=> order.delivery_address)
    orders: []
}
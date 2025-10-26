import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { AdressEntity } from "./adresses.entity";
import { OrderEntity } from "./order.entity";

@Entity()
export class UserEntity {
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

    @OneToMany(
        ()=> AdressEntity, 
        (adress)=> adress.user, 
        { cascade: true, onDelete: "CASCADE" }
    )
    adress: AdressEntity[];

    @OneToMany(()=> OrderEntity, (order)=> order.user)
    order: OrderEntity;
}
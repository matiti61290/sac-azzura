import { Adress } from "src/shared/interfaces/address.interface";
import { User } from "src/shared/interfaces/user.interface";
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class AdressEntity implements Adress {
    @PrimaryGeneratedColumn({ type: 'int' })
    id: number
    
    @Column({ length: 255 })
    street: string

    @Column({ length: 255 })
    additionnal: string

    @Column({ type: 'int' })
    zipcode: number;

    @Column({ length: 255 })
    city: string;

    user: User;
}
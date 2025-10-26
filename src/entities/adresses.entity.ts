import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { UserEntity } from "./user.entity";

@Entity()
export class AdressEntity {
    @PrimaryGeneratedColumn({ type: 'int' })
    id: number

    @Column({
        type: 'enum',
        enum: ['delivary', 'billing']
    })
    type: 'delivary' | 'billing'
    
    @Column({ length: 255 })
    street: string

    @Column({ length: 255 })
    additionnal: string

    @Column({ type: 'int' })
    zipcode: number;

    @Column({ length: 255 })
    city: string;

    @ManyToOne(()=> UserEntity, (user)=>user.adress)
    user: UserEntity;
}
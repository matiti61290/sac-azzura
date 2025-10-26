import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index } from "typeorm";
import { UserEntity } from "./user.entity";

@Entity('Address')
export class AddressEntity {
    @PrimaryGeneratedColumn({ type: 'int' })
    id: number

    @Column({
        type: 'enum',
        enum: ['delivery', 'billing']
    })
    type: 'delivery' | 'billing'
    
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
}
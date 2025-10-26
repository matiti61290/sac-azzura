import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { OrderEntity } from "./order.entity";

@Entity()
export class PromotionEntity {
    @PrimaryGeneratedColumn({ type: "int" })
    id: number;

    @Column({ length: 255 })
    code: string;

    @Column({ length: 255 })
    type: string;

    @Column({ type: "int" })
    valeur: number;

    @Column()
    stardate: Date;

    @Column()
    enddate: Date;

    @Column({ length: 255 })
    condition: string;

    @Column()
    isActive: boolean;

    @OneToMany(()=>OrderEntity, (order)=> order.promotion)
    order: OrderEntity[]
}
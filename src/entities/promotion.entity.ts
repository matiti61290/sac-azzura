import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { OrderEntity } from "./order.entity";

@Entity('Promotion')
export class PromotionEntity {
    @PrimaryGeneratedColumn({ type: "int" })
    id: number;

    @Column({ length: 255, nullable: false, unique: true })
    code: string;

    @Column({ length: 255, name: 'promotion_type' })
    promotionType: string;

    @Column({ type: "int", nullable: false })
    valeur: number;

    @Column({ type: 'datetime' })
    startdate: Date;

    @Column({ type: 'datetime' })
    enddate: Date;

    @Column({ type: 'text', nullable: true })
    condition: string;

    @Column()
    isActive: boolean;

    @OneToMany(()=>OrderEntity, (order)=> order.promotion)
    orders: OrderEntity[]
}
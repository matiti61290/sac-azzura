import { Order } from "src/shared/interfaces/order.interface";
import { Promotion } from "src/shared/interfaces/promotion.interface";
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class PromotionEntity implements Promotion {
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

    order: Order;
}
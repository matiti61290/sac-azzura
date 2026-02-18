import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { OrderEntity } from "./order.entity";
import { PromotionType } from "src/shared/enum/promotionType.enum";

@Entity('Promotion')
export class PromotionEntity {
    @PrimaryGeneratedColumn({ type: "int" })
    id: number;

    @Column({ length: 255, nullable: false, unique: true })
    code: string;

    @Column({ type: 'enum', enum: PromotionType, default: PromotionType.PERCENTAGE})
    promotionType: PromotionType

    @Column({ type: 'int', nullable: true })
    percentageValue: number

    @Column({ type: 'int', nullable: true})
    fixedValue: number

    @Column({ type: 'datetime'})
    startdate: Date

    @Column({ type: 'datetime' })
    enddate: Date;

    @Column({ type: 'int', nullable: true})
    minAmount: number

    @Column({ type: 'json', nullable: true})
    categories: string[]

    @Column()
    isActive: boolean;

    @OneToMany(()=>OrderEntity, (order)=> order.promotion)
    orders: OrderEntity[]

    get isExpired(): boolean {
        return this.enddate < new Date()
    }
}
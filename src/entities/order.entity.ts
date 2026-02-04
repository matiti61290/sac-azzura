import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index, OneToMany } from "typeorm";
import { UserEntity } from "./user.entity";
import { PromotionEntity } from "./promotion.entity";
import { OrderStatus } from "src/shared/enum/order.enum";
import { OrderItemEntity } from "./orderItem.entity";

@Entity('Order')
export class OrderEntity {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(()=> UserEntity, (user)=> user.orders, { cascade: true})
    user: UserEntity

    @OneToMany(()=> OrderItemEntity, (item)=> item.order, {cascade: true})
    items: OrderItemEntity[]

    @Column({ type: "enum", enum: OrderStatus, default: OrderStatus.PENDING})
    status: OrderStatus

    @Column({ type: 'decimal', precision: 10, scale:2})
    totalAmount: number

    @Column({nullable: true})
    trackingNumber

    @Column({ nullable: true})
    stripeSessionId: string

    @ManyToOne(()=> PromotionEntity, {nullable: true})
    promotion: PromotionEntity

    @Column({ 
        type: 'timestamp', 
        default: ()=> "CURRENT_TIMESTAMP"
    })
    createdAt: Date
}
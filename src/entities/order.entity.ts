import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index, OneToMany } from "typeorm";
import { UserEntity } from "./user.entity";
import { PromotionEntity } from "./promotion.entity";
import { OrderStatus } from "src/shared/enum/order.enum";
import { OrderItemEntity } from "./orderItem.entity";
import { AddressEntity } from "./addresses.entity";
import type { ShippingDetailsData } from "src/shared/interfaces/ShippingDetailData.interface";
import { Carrier } from "src/shared/enum/carrier.enum";

@Entity('Order')
export class OrderEntity {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(()=> UserEntity, (user)=> user.orders, { cascade: true})
    user: UserEntity

    @ManyToOne(()=> AddressEntity)
    delivery_address: AddressEntity

    @ManyToOne(()=> AddressEntity)
    billing_address: AddressEntity

    @OneToMany(()=> OrderItemEntity, (item)=> item.order, {cascade: true})
    items: OrderItemEntity[]

    @Column({ type: "enum", enum: OrderStatus, default: OrderStatus.PENDING})
    status: OrderStatus

    @Column({ type: 'decimal', precision: 10, scale:2})
    totalAmount: number

    @Column({ nullable: true})
    stripeSessionId: string

    @ManyToOne(()=> PromotionEntity, {nullable: true})
    promotion: PromotionEntity

    @Column({ 
        type: 'timestamp', 
        default: ()=> "CURRENT_TIMESTAMP"
    })
    createdAt: Date

    @Column({type: "enum", enum: Carrier, nullable: true})
    carrier: Carrier
    
    @Column({nullable: true})
    trackingNumber: string

    @Column({ type: 'json', nullable: true})
    trackingDetails: ShippingDetailsData

    @Column({nullable: true})
    shippedAt: Date
}
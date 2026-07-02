// order.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { UserEntity } from "./user.entity";
import { PromotionEntity } from "./promotion.entity";
import { AddressEntity } from "./addresses.entity";
import { OrderStatus } from "../shared/enum/order.enum";
import { OrderItemEntity } from "./OrderItem.entity";
import type { ShippingDetailsData } from "../shared/interfaces/ShippingDetailData.interface";
import { Carrier } from "../shared/enum/carrier.enum";
import { Exclude } from "class-transformer";

@Entity('Order')
export class OrderEntity {
    @PrimaryGeneratedColumn()
    id!: number

    @ManyToOne(() => UserEntity, (user) => user.orders, { onDelete: "CASCADE" })
    @Exclude()
    user!: UserEntity

    @ManyToOne(() => AddressEntity, { onDelete: 'SET NULL', nullable: true })
    delivery_address!: AddressEntity | null

    @ManyToOne(() => AddressEntity, { onDelete: 'SET NULL', nullable: true })
    billing_address!: AddressEntity | null
    
    @OneToMany(() => OrderItemEntity, (item) => item.order, { cascade: true })
    items!: OrderItemEntity[]

    @Column({ type: "enum", enum: OrderStatus, default: OrderStatus.PENDING })
    status!: OrderStatus

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    totalAmount!: number

    @Column({ nullable: true })
    stripeSessionId!: string

    @ManyToOne(() => PromotionEntity, { nullable: true })
    promotion!: PromotionEntity

    @Column({ 
        type: 'timestamp', 
        default: () => "CURRENT_TIMESTAMP"
    })
    createdAt!: Date

    @Column({ type: "enum", enum: Carrier, nullable: true })
    carrier!: Carrier
    
    @Column({ nullable: true })
    trackingNumber!: string

    @Column({ nullable: true })
    lastTrackingUpdate!: Date

    @Column({ type: 'json', nullable: true })
    shippingDetails!: ShippingDetailsData

    @Column({ nullable: true })
    shippedAt!: Date
}
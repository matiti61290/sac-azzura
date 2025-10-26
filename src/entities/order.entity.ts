import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index } from "typeorm";
import { UserEntity } from "./user.entity";
import { ProductEntity } from "./product.entity";
import { PromotionEntity } from "./promotion.entity";
import { OrderStatus } from "src/shared/enum/order.enum";

@Entity('Order')
export class OrderEntity {
    @PrimaryGeneratedColumn({ type: 'int' })
    id: number;

    @ManyToOne(
        ()=> UserEntity, 
        (user)=> user.orders, 
        {onDelete: "SET NULL"}
    )
    user: UserEntity;

    @ManyToOne(
        ()=> ProductEntity, 
        (product)=> product.orders, 
        {onDelete: "SET NULL"}
    )
    product: ProductEntity;

    @ManyToOne(
        ()=>PromotionEntity, 
        (promotion)=> promotion.orders, 
        {onDelete: "SET NULL"}
    )
    promotion: PromotionEntity;

    @Column({
        type:'enum',
        enum: OrderStatus,
        default: OrderStatus.PENDING
    })
    @Index()
    status: OrderStatus

    @Column({
        type: 'int',
        default: 1
    })
    quantity: number

    @Column({ 
        type: 'decimal',
        precision: 20,
        scale: 2
    })
    priceAtPurchase: number

    @Column({ 
        type: 'decimal', 
        precision: 10, scale: 2 
    })
    total: number

    @Column({ 
        type: 'timestamp', 
        default: ()=> "CURRENT_TIMESTAMP"
    })
    createdAt: Date
}
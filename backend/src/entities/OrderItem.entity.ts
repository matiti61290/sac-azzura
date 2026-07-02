// OrderItem.entity.ts
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { OrderEntity } from "./order.entity";
import { StockEntity } from "./stock.entity";

@Entity('OrderItem')
export class OrderItemEntity {
    @PrimaryGeneratedColumn()
    id!: number

    @ManyToOne(() => OrderEntity, (order) => order.items, { onDelete: "CASCADE" })
    order!: OrderEntity

    @ManyToOne(() => StockEntity)
    stock!: StockEntity 

    @Column({ type: 'int' })
    quantity!: number

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    priceAtPurchase!: number
}
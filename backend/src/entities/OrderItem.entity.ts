import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { OrderEntity } from "./order.entity";
import { StockEntity } from "./stock.entity";

@Entity('OrderItem')
export class OrderItemEntity{
    @PrimaryGeneratedColumn()
    id!: number

    @ManyToOne(()=> OrderEntity, (order)=> order.items)
    order!: OrderEntity

    @ManyToOne(()=>StockEntity)
    stock!: StockEntity //utiliser le SKU au lieu de l'id

    @Column({type: 'int'})
    quantity!: number

    @Column({ type: 'decimal', precision: 10, scale: 2})
    priceAtPurchase!: number
}
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne , Index, OneToMany} from "typeorm";
import { ColorEntity } from "./color.entity";
import { MaterialEntity } from "./material.entity";
import { ProductEntity } from "./product.entity";
import { OrderEntity } from "./order.entity";
import { OrderItemEntity } from "./OrderItem.entity";

@Entity('Stock')
export class StockEntity {
    @PrimaryGeneratedColumn({ type: 'int' })
    id: number;

    @ManyToOne(
        ()=> ProductEntity, 
        (product)=> product.stocks, 
        { onDelete: "SET NULL", nullable: true}
    )
    product: ProductEntity | null;

    @ManyToOne(()=> MaterialEntity, (material)=> material.stocks)
    material: MaterialEntity

    @ManyToOne(()=> ColorEntity, (color)=> color.stocks)
    color: ColorEntity;

    @Column({ type: 'int' })
    quantity: number;

    @Column({ 
        type: 'datetime', 
        default: () => 'CURRENT_TIMESTAMP' 
    })
    createdAt: Date;

    @Column({
        type: 'datetime', 
        default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' 
    })
    updatedAt: Date;

    @Column({ length: 50, unique: true })
    sku: string
}
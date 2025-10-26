import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, Index } from "typeorm";
import { SubcategoryEntity } from "./subcategory.entity";
import { StockEntity } from "./stock.entity";
import { OrderEntity } from "./order.entity";

@Entity('Product')
export class ProductEntity {
    @PrimaryGeneratedColumn({ type: 'int' })
    id: number;

    @Column({ length: 255, nullable: false, unique: true })
    @Index()
    name: string;

    @Column({ length: 255, nullable: false })
    description: string;

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: false })
    price: number;

    @Column({ length: 512 })
    imageUrl: string;

    @ManyToOne(()=> SubcategoryEntity, (subcategory)=>subcategory.products)
    subcategory: SubcategoryEntity;
    
    @OneToMany(
        ()=> StockEntity, 
        (stock)=> stock.product,
        { cascade: true }
    )
    stocks: StockEntity[]

    @OneToMany(()=> OrderEntity, (order)=> order.product)
    orders: OrderEntity[]

    @Column({ 
        type: 'timestamp', 
        default: ()=> "CURRENT_TIMESTAMP"
    })
    createdAt: Date

        @Column({ 
        type: 'timestamp', 
        default: ()=> "CURRENT_TIMESTAMP",
        onUpdate: 'CURRENT_TIMESTAMP'
    })
    updatedAt: Date

    @Column({ default: true })
    isActive: boolean
}
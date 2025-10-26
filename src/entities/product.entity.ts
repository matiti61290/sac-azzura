import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { SubcategoryEntity } from "./subcategory.entity";
import { StockEntity } from "./stock.entity";
import { OrderEntity } from "./order.entity";

@Entity()
export class ProductEntity {
    @PrimaryGeneratedColumn({ type: 'int' })
    id: number;

    @Column({ length: 255 })
    product: string;

    @Column({ length: 255 })
    description: string;

    @Column({ type: "int" })
    price: number;

    @Column({ length: 255 })
    image_url: string;

    @ManyToOne(()=> SubcategoryEntity, (subcategory)=>subcategory.product)
    subcategory: SubcategoryEntity;
    
    @OneToMany(()=> StockEntity, (stock)=> stock.product)
    stock: StockEntity[]

    @OneToMany(()=> OrderEntity, (order)=> order.product)
    order: OrderEntity[]
}
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { ColorEntity } from "./color.entity";
import { MaterialEntity } from "./material.entity";
import { ProductEntity } from "./product.entity";

@Entity()
export class StockEntity {
    @PrimaryGeneratedColumn({ type: 'int' })
    id: number;

    @ManyToOne(()=> ProductEntity, (product)=> product.stock)
    product: ProductEntity;

    @ManyToOne(()=> MaterialEntity, (material)=> material.stock)
    material: MaterialEntity

    @ManyToOne(()=> ColorEntity, (color)=> color.stock)
    color: ColorEntity;

    @Column({ type: 'int' })
    quantity: number;

    @Column({ length: 255 })
    sku: string;
}
import { Color } from "src/shared/interfaces/color.interface";
import { Material } from "src/shared/interfaces/material.interface";
import { Product } from "src/shared/interfaces/product.interface";
import { Stock } from "src/shared/interfaces/stock.interface";
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class StockEntity implements Stock {
    @PrimaryGeneratedColumn({ type: 'int' })
    id: number;

    product: Product;

    material: Material;

    color: Color;

    @Column({ type: 'int' })
    quantity: number;

    @Column({ length: 255 })
    sku: string;
}
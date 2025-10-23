import { Order } from "src/shared/interfaces/order.interface";
import { Product } from "src/shared/interfaces/product.interface";
import { Stock } from "src/shared/interfaces/stock.interface";
import { Subcategory } from "src/shared/interfaces/subcategory.interface";
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class ProductEntity implements Product {
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

    subcategory: Subcategory;
    
    stock: Stock;

    order: Order;
}
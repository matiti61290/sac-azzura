import { Order } from "src/shared/interfaces/order.interface";
import { Product } from "src/shared/interfaces/product.interface";
import { Promotion } from "src/shared/interfaces/promotion.interface";
import { User } from "src/shared/interfaces/user.interface";
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class OrderEntity implements Order {
    @PrimaryGeneratedColumn({ type: 'int' })
    id: number;

    user: User;

    product: Product;

    promotion: Promotion;

    @Column({ length: 255 })
    status: string;
}
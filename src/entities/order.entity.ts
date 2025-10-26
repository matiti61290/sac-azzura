import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { UserEntity } from "./user.entity";
import { ProductEntity } from "./product.entity";
import { PromotionEntity } from "./promotion.entity";

@Entity()
export class OrderEntity {
    @PrimaryGeneratedColumn({ type: 'int' })
    id: number;

    @ManyToOne(()=> UserEntity, (user)=> user.order)
    user: UserEntity;

    @ManyToOne(()=> ProductEntity, (product)=> product.order)
    product: ProductEntity;

    @ManyToOne(()=>PromotionEntity, (promotion)=> promotion.order)
    promotion: PromotionEntity;

    @Column({ length: 255 })
    status: string;
}
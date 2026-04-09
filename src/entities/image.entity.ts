import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ProductEntity } from "./product.entity";

@Entity()
export class ImageEntity {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    key!: string

    @ManyToOne(()=> ProductEntity, (product) => product.images)
    product!: ProductEntity
}
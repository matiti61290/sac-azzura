import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ProductEntity } from "./product.entity";

@Entity('Image')
export class ImageEntity {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    key!: string

    @ManyToOne(()=> ProductEntity, (product) => product.images)
    product!: ProductEntity
}
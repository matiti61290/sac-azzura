import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ProductEntity } from "./product.entity";
import { Product } from "aws-sdk/clients/ssm";

@Entity()
export class ImageEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    url: string

    @ManyToOne(()=> ProductEntity, (product) => product.images)
    product: ProductEntity
}
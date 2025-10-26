import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { CategoryEntity } from "./categories.entity";
import { ProductEntity } from "./product.entity";

@Entity()
export class SubcategoryEntity {
    @PrimaryGeneratedColumn({ type: 'int' })
    id: number;

    @Column({ length: 255 })
    subcategory: string;

    @OneToMany(()=> ProductEntity, (product)=> product.subcategory)
    product: ProductEntity;

    @ManyToOne(()=> CategoryEntity, (category)=> category.subcategory)
    category: CategoryEntity;
}
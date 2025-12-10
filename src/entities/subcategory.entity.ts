import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, Index } from "typeorm";
import { CategoryEntity } from "./categories.entity";
import { ProductEntity } from "./product.entity";

@Entity('Subcategory')
export class SubcategoryEntity {
    @PrimaryGeneratedColumn({ type: 'int' })
    id: number;

    @Column({ length: 255, unique: true })
    name: string;

    @OneToMany(()=> ProductEntity, (product)=> product.subcategory)
    products: ProductEntity[];

    @ManyToOne(
        ()=> CategoryEntity, 
        (category)=> category.subcategories,
        {onDelete: "CASCADE"}
    )
    category: CategoryEntity;

    @Column({ length: 5, nullable: false, unique: true})
    sku_code: string
}
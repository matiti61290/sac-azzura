import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Index } from "typeorm";
import { SubcategoryEntity } from "./subcategory.entity";

@Entity('Category')
export class CategoryEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ length: 255, nullable: false, unique: true })
    name!: string;

    @OneToMany(
        ()=> SubcategoryEntity, 
        (subcategory)=> subcategory.category,
        { cascade: true}
    )
    subcategories!: SubcategoryEntity[];

    @Column({length: 5, nullable: false, unique: true})
    sku_code!: string
}
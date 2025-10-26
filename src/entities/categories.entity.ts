import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { SubcategoryEntity } from "./subcategory.entity";

@Entity()
export class CategoryEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 255 })
    category: string;

    @OneToMany(()=> SubcategoryEntity, (subcategory)=> subcategory.category)
    subcategory: SubcategoryEntity[];
}
import { Category } from "src/shared/interfaces/category.interface";
import { Subcategory } from "src/shared/interfaces/subcategory.interface";
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class CategoryEntity implements Category {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 255 })
    category: string;

    subcategory: Subcategory;
}
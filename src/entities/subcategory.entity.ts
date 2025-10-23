import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { Subcategory } from "src/shared/interfaces/subcategory.interface";
import { Product } from "src/shared/interfaces/product.interface";
import { Category } from "src/shared/interfaces/category.interface";

@Entity()
export class SubcategoryEntity implements Subcategory{
    @PrimaryGeneratedColumn({ type: 'int' })
    id: number;

    @Column({ length: 255 })
    subcategory: string;

    products: Product;

    category: Category;
}
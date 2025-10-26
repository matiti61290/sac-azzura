import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { StockEntity } from "./stock.entity";

@Entity()
export class ColorEntity {
    @PrimaryGeneratedColumn({ type: 'int' })
    id: number;

    @Column({ length: 255 })
    color: string;

    @OneToMany(()=> StockEntity, (stock)=> stock.color)
    stock: StockEntity[];
}
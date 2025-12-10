import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Index } from "typeorm";
import { StockEntity } from "./stock.entity";

@Entity('Color')
export class ColorEntity {
    @PrimaryGeneratedColumn({ type: 'int' })
    id: number;

    @Column({ length: 255, nullable: false, unique: true })
    name: string;

    @OneToMany(()=> StockEntity, (stock)=> stock.color)
    stocks: StockEntity[];

    @Column({ length: 5, nullable: false, unique: true })
    sku_code: string
}
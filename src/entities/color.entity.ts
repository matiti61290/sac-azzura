import { Color } from "src/shared/interfaces/color.interface";
import { Stock } from "src/shared/interfaces/stock.interface";
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class ColorEntity implements Color {
    @PrimaryGeneratedColumn({ type: 'int' })
    id: number;

    color: string;

    stock: Stock;
}
import { Material } from "src/shared/interfaces/material.interface";
import { Stock } from "src/shared/interfaces/stock.interface";
import { Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class MaterialEntity implements Material {
    id: number;

    material: string;

    stock: Stock;
}
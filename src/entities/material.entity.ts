import { Entity, PrimaryGeneratedColumn, Column, OneToMany} from "typeorm";
import { StockEntity } from "./stock.entity";

@Entity()
export class MaterialEntity {
    @PrimaryGeneratedColumn({ type: 'int' })
    id: number;

    @Column({ length: 255 })
    material: string;

    @OneToMany(()=> StockEntity, (stock)=> stock.material)
    stock: StockEntity[];
}
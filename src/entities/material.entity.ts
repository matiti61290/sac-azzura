import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Index} from "typeorm";
import { StockEntity } from "./stock.entity";

@Entity('Material')
export class MaterialEntity {
    @PrimaryGeneratedColumn({ type: 'int' })
    id: number;

    @Column({ length: 255, nullable: false, unique: true })
    @Index()
    name: string;

    @OneToMany(()=> StockEntity, (stock)=> stock.material)
    stocks: StockEntity[];
}
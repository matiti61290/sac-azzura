import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ColorEntity } from "src/entities/color.entity";
import { MaterialEntity } from "src/entities/material.entity";
import { ProductEntity } from "src/entities/product.entity";
import { StockEntity } from "src/entities/stock.entity";
import { StockController } from "./stock.controller";
import { StockService } from "./stock.service";
import { ProductService } from "../product/product.service";

@Module({
    imports: [TypeOrmModule.forFeature([StockEntity,ProductEntity, ColorEntity, MaterialEntity])],
    controllers: [StockController],
    providers: [StockService],
})

export class StockModule {}
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ColorEntity } from "src/entities/color.entity";
import { MaterialEntity } from "src/entities/material.entity";
import { ProductEntity } from "src/entities/product.entity";
import { StockEntity } from "src/entities/stock.entity";
import { StockController } from "./stock.controller";
import { StockService } from "./stock.service";
import { ProductService } from "../product/product.service";
import { SubcategoryEntity } from "src/entities/subcategory.entity";
import { ImageEntity } from "src/entities/image.entity";
import { AwsS3Service } from "../aws-s3/aws-s3.service";

@Module({
    imports: [TypeOrmModule.forFeature([StockEntity, SubcategoryEntity, ImageEntity, ProductEntity, ColorEntity, MaterialEntity])],
    controllers: [StockController],
    providers: [StockService, ProductService, AwsS3Service],
})

export class StockModule {}
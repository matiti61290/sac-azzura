import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { StockController } from "./stock.controller";
import { StockService } from "./stock.service";
import { ProductService } from "../product/product.service";
import { AwsS3Service } from "../aws-s3/aws-s3.service";
import { ColorEntity } from "../../entities/color.entity";
import { MaterialEntity } from "../../entities/material.entity";
import { ProductEntity } from "../../entities/product.entity";
import { StockEntity } from "../../entities/stock.entity";
import { SubcategoryEntity } from "../../entities/subcategory.entity";
import { ImageEntity } from "../../entities/image.entity";

@Module({
    imports: [TypeOrmModule.forFeature([StockEntity, SubcategoryEntity, ImageEntity, ProductEntity, ColorEntity, MaterialEntity])],
    controllers: [StockController],
    providers: [StockService, ProductService, AwsS3Service],
})

export class StockModule {}
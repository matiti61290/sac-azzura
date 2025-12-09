import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProductEntity } from "src/entities/product.entity";
import { ProductController } from "./product.controller";
import { ProductService } from "./product.service";
import { SubcategoryEntity } from "src/entities/subcategory.entity";
import { ImageEntity } from "src/entities/image.entity";
import { AwsS3Service } from "../aws-s3/aws-s3.service";
import { AuthModule } from "../auth/auth.module";
import { StockService } from "../stock/stock.service";
import { StockEntity } from "src/entities/stock.entity";
import { ColorEntity } from "src/entities/color.entity";
import { MaterialEntity } from "src/entities/material.entity";

@Module({
    imports:[TypeOrmModule.forFeature([ProductEntity, ColorEntity, MaterialEntity, SubcategoryEntity, ImageEntity, StockEntity]), AuthModule],
    controllers: [ProductController],
    providers: [ProductService, AwsS3Service, StockService],
    exports: [ProductService]
})

export class ProductModule {}
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProductController } from "./product.controller";
import { ProductService } from "./product.service";
import { AwsS3Service } from "../aws-s3/aws-s3.service";
import { AuthModule } from "../auth/auth.module";
import { StockService } from "../stock/stock.service";
import { ProductEntity } from "../../entities/product.entity";
import { SubcategoryEntity } from "../../entities/subcategory.entity";
import { ImageEntity } from "../../entities/image.entity";
import { StockEntity } from "../../entities/stock.entity";
import { ColorEntity } from "../../entities/color.entity";
import { MaterialEntity } from "../../entities/material.entity";

@Module({
    imports:[TypeOrmModule.forFeature([ProductEntity, ColorEntity, MaterialEntity, SubcategoryEntity, ImageEntity, StockEntity]), AuthModule],
    controllers: [ProductController],
    providers: [ProductService, AwsS3Service, StockService],
    exports: [ProductService]
})

export class ProductModule {}
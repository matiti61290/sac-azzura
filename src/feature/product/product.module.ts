import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProductEntity } from "src/entities/product.entity";
import { ProductController } from "./product.controller";
import { ProductService } from "./product.service";
import { SubcategoryEntity } from "src/entities/subcategory.entity";
import { AwsS3Module } from "../aws-s3/awsS3.module";

@Module({
    imports:[TypeOrmModule.forFeature([ProductEntity, SubcategoryEntity]), AwsS3Module],
    controllers: [ProductController],
    providers: [ProductService]
})

export class ProductModule {}
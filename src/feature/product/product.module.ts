import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProductEntity } from "src/entities/product.entity";
import { ProductController } from "./product.controller";
import { ProductService } from "./product.service";
import { SubcategoryEntity } from "src/entities/subcategory.entity";

@Module({
    imports:[TypeOrmModule.forFeature([ProductEntity, SubcategoryEntity])],
    controllers: [ProductController],
    providers: [ProductService]
})

export class ProductModule {}
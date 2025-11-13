import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SubcategoryEntity } from "src/entities/subcategory.entity";
import { SubcategoryController } from "./subcategory.controller";
import { SubcategoryService } from "./subcategory.service";
import { CategoryEntity } from "src/entities/categories.entity";
import { JwtService } from "@nestjs/jwt";

@Module({
    imports: [TypeOrmModule.forFeature([SubcategoryEntity, CategoryEntity])],
    controllers: [SubcategoryController],
    providers: [SubcategoryService, JwtService]
})

export class SubcategoryModule {}
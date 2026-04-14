import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SubcategoryController } from "./subcategory.controller";
import { SubcategoryService } from "./subcategory.service";
import { JwtService } from "@nestjs/jwt";
import { SubcategoryEntity } from "../../entities/subcategory.entity";
import { CategoryEntity } from "../../entities/categories.entity";

@Module({
    imports: [TypeOrmModule.forFeature([SubcategoryEntity, CategoryEntity])],
    controllers: [SubcategoryController],
    providers: [SubcategoryService, JwtService]
})

export class SubcategoryModule {}
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CategoryService } from "./category.service";
import { CategoryController } from "./category.controller";
import { CategoryEntity } from "../../entities/categories.entity";


@Module({
    imports: [TypeOrmModule.forFeature([CategoryEntity])],
    controllers: [CategoryController],
    providers: [CategoryService]
})

export class CategoryModule {}
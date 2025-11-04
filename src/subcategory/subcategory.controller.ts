import { Controller, Get } from "@nestjs/common";
import { SubcategoryService } from "./subcategory.service";

@Controller('subcategory')
export class SubcategoryController{
    constructor(
        private readonly subcategoryService: SubcategoryService
    ) {}

    @Get('')
    async getAllProduct(){
        return this.subcategoryService.getAllSubcategories()
    }
}
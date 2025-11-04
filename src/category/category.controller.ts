import { Controller, Get, Param, ParseIntPipe, Post, Body } from "@nestjs/common";
import { CategoryService } from "./category.service";
import { AddCategoryDto } from "src/shared/dtos/category/addCategory.dto";
import { UpdateCategoryDto } from "src/shared/dtos/category/updateCategory.dto";

@Controller('category')
export class CategoryController{
    constructor(
        private readonly categoryService: CategoryService
    ) {}

    @Get('')
    async getAllCategory(){
        return this.categoryService.getAllCategory()
    }

    @Get('/:categoryId')
    async findCategoryById(
        @Param('categoryId', ParseIntPipe) categoryId: number
    ) {
        return this.categoryService.findCategoryById(categoryId)
    }

    @Post('add-category')
    async addCategory(
        @Body() addCategoryDto: AddCategoryDto
    ){
        return this.categoryService.addCategory(addCategoryDto)
    }

    @Post('update-category/:categoryId')
    async updateCategory(
        @Param('categoryId', ParseIntPipe) categoryId: number,
        @Body() updateCategoryDto: UpdateCategoryDto
    ){
        return this.categoryService.updateCategory(categoryId, updateCategoryDto)
    }

    @Post('delete-category/:categoryId')
    async deleteCategory(
        @Param('categoryId', ParseIntPipe) categoryId: number
    ) {
        return this.categoryService.deleteCategory(categoryId)
    }
}
import { Controller, Get, Param, ParseIntPipe, Post, Body, UseGuards, Patch, Delete } from "@nestjs/common";
import { CategoryService } from "./category.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdminGuard } from "../auth/guards/admin.guard";
import { AddCategoryDto } from "../../shared/dtos/category/addCategory.dto";
import { UpdateCategoryDto } from "../../shared/dtos/category/updateCategory.dto";

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
    @UseGuards(JwtAuthGuard, AdminGuard)
    async addCategory(
        @Body() addCategoryDto: AddCategoryDto
    ){
        return this.categoryService.addCategory(addCategoryDto)
    }

    @Patch('update-category/:categoryId')
    @UseGuards(JwtAuthGuard, AdminGuard)
    async updateCategory(
        @Param('categoryId', ParseIntPipe) categoryId: number,
        @Body() updateCategoryDto: UpdateCategoryDto
    ){
        return this.categoryService.updateCategory(categoryId, updateCategoryDto)
    }

    @Delete('delete-category/:categoryId')
    @UseGuards(JwtAuthGuard, AdminGuard)
    async deleteCategory(
        @Param('categoryId', ParseIntPipe) categoryId: number
    ) {
        return this.categoryService.deleteCategory(categoryId)
    }
}
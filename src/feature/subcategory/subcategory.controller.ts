import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from "@nestjs/common";
import { SubcategoryService } from "./subcategory.service";
import { AddSubcategoryDto } from "src/shared/dtos/subcategory/addSubcategory.dto";
import { UpdateSubcategoryDto } from "src/shared/dtos/subcategory/updateSubcategory.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdminGuard } from "../auth/guards/admin.guard";

@Controller('subcategory')
export class SubcategoryController{
    constructor(
        private readonly subcategoryService: SubcategoryService
    ) {}

    @Get('')
    async getAllProduct(){
        return this.subcategoryService.getAllSubcategories()
    }

    @Get('/:subcategoryId')
    async findSubcategoryById(
        @Param('subcategoryId', ParseIntPipe) subcategoryId: number
    ) {
        return this.subcategoryService.FindSubcategoryById(subcategoryId)
    }

    @Post('add-subcategory')
    @UseGuards(JwtAuthGuard, AdminGuard)
    async addSubcategory(
        @Body() addSubcategoryDto: AddSubcategoryDto
    ) {
        return this.subcategoryService.createSubcategory(addSubcategoryDto)
    }

    @Post('update-subcategory/:subcategoryId')
    @UseGuards(JwtAuthGuard, AdminGuard)
    async updateSubcategory(
        @Param('subcategoryId', ParseIntPipe) subcategoryId: number,
        @Body() updateSubcategoryDto: UpdateSubcategoryDto 
    ) {
        return this.subcategoryService.updateSubcategory(subcategoryId, updateSubcategoryDto)
    }

    @Post('delete-subcategory/:subcategoryId')
    @UseGuards(JwtAuthGuard, AdminGuard)
    async deleteSubcategory(
        @Param('subcategoryId', ParseIntPipe) subcategoryId: number
    ) {
        this.subcategoryService.deleteSubcategory(subcategoryId)
        return "Subcategorie supprimee"
    }
}
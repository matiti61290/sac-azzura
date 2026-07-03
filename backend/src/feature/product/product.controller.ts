import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common";
import { ProductService } from "./product.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdminGuard } from "../auth/guards/admin.guard";
import { FilesInterceptor } from "@nestjs/platform-express";
import { AddProductDto } from "../../shared/dtos/product/addProduct.dto";
import { UpdateProductDto } from "../../shared/dtos/product/updateProduct.dto";

@Controller('products')
export class ProductController {
    constructor(
        private readonly productService: ProductService
    ) {}

    @Get('')
    async getAllProduct(){
        return this.productService.getAllProducts()
    }

    @Get('/:productId')
    async findProduct(
        @Param('productId', ParseIntPipe) productId: number)
    {
        let product = await this.productService.findProduct(productId)

        return product
    }

@Post('add-product')
    @UseGuards(JwtAuthGuard, AdminGuard)
    @UseInterceptors(FilesInterceptor('files'))
    async addProduct(
        @Body() addProductDto: AddProductDto,
        @UploadedFiles() files: Express.Multer.File[]
    ) {
        // string turned into JS table
        const variationsArray = JSON.parse(addProductDto.variations);
        
        return this.productService.createProduct(addProductDto, files, variationsArray);
    }

    @Patch('update-product/:productId')
    @UseGuards(JwtAuthGuard, AdminGuard)
    @UseInterceptors(FilesInterceptor('files'))
    async updateProduct(
        @Param('productId', ParseIntPipe) productId: number,
        @Body() updateProductDto: UpdateProductDto,
        @UploadedFiles() files: Express.Multer.File[]
    ){
        updateProductDto.files = files
        return this.productService.updateProduct(productId, updateProductDto)
    }

    @Delete('delete-product/:productId')
    @UseGuards(JwtAuthGuard, AdminGuard)
    async deleteProduct(
        @Param('productId', ParseIntPipe) productId: number
    ) {
        this.productService.deleteProduct(productId)
        return "Produit supprimé"
    }
}
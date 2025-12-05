import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common";
import { ProductService } from "./product.service";
import { AddProductDto } from "src/shared/dtos/product/addProduct.dto";
import { UpdateProductDto } from "src/shared/dtos/product/updateProduct.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdminGuard } from "../auth/guards/admin.guard";
import { FilesInterceptor } from "@nestjs/platform-express";

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
        // return this.productService.findProduct(productId)
        let product = await this.productService.findProduct(productId)

        return product?.images
    }

    @Post('add-product')
    @UseGuards(JwtAuthGuard, AdminGuard)
    @UseInterceptors(FilesInterceptor('files'))
    async addProduct(
        @Body() addProductDto: AddProductDto,
        @UploadedFiles() files: Express.Multer.File[]
    ) {
        addProductDto.files = files
        return this.productService.createProduct(addProductDto)
    }

    @Post('update-product/:productId')
    @UseGuards(JwtAuthGuard, AdminGuard)
    async updateProduct(
        @Param('productId', ParseIntPipe) productId: number,
        @Body() updateProductDto: UpdateProductDto
    ){
        return this.productService.updateProduct(productId, updateProductDto)
    }

    @Post('delete-product/:productId')
    @UseGuards(JwtAuthGuard, AdminGuard)
    async deleteProduct(
        @Param('productId', ParseIntPipe) productId: number
    ) {
        this.productService.deleteProduct(productId)
        return "Produit supprime"
    }
}
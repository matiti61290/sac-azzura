import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from "@nestjs/common";
import { ProductService } from "./product.service";
import { AddProductDto } from "src/shared/dtos/product/addProduct.dto";
import { UpdateProductDto } from "src/shared/dtos/product/updateProduct.dto";

@Controller('product')
export class ProductController {
    constructor(
        private readonly productService: ProductService
    ) {}

    @Get('products')
    async getAllProduct(){
        return this.productService.getAllProducts()
    }

    @Get('/:productId')
    async findProduct(
        @Param('productId', ParseIntPipe) productId: number)
    {
        return this.productService.findProduct(productId)
    }

    @Post('add-product')
    async addProduct(@Body() addProductDto: AddProductDto) {
        return this.productService.createProduct(addProductDto)
    }

    @Post('update-product/:productId')
    async updateProduct(
        @Param('productId', ParseIntPipe) productId: number,
        @Body() updateProductDto: UpdateProductDto
    ){
        return this.productService.updateProduct(productId, updateProductDto)
    }

    @Post('delete-product/:productId')
    async deleteProduct(
        @Param('productId', ParseIntPipe) productId: number
    ) {
        this.productService.deleteProduct(productId)
        return "Produit supprime"
    }
}
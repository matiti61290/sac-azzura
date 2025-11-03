import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from "@nestjs/common";
import { ProductService } from "./product.service";
import { ProductDto } from "src/shared/dtos/product.dto";

@Controller('product')
export class ProductController {
    constructor(
        private readonly productService: ProductService
    ) {}

    @Get('/:productId')
    async findProduct(
        @Param('productId', ParseIntPipe) productId: number)
    {
        return this.productService.findProduct(productId)
    }

    @Post('add-product')
    async addProduct(@Body() productDto: ProductDto) {
        return this.productService.createProduct(productDto)
    }
}
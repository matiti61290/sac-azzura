import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ProductEntity } from "src/entities/product.entity";
import { ProductDto } from "src/shared/dtos/product.dto";
import { Repository } from "typeorm";

@Injectable()
export class ProductService {
    constructor(
        @InjectRepository(ProductEntity)
        private readonly productRepository: Repository<ProductEntity> 
    ) {}

    async findProduct(productId: number){
        const product = this.productRepository.findOne({ where: {id: productId}})

        if(!product){
            throw new NotFoundException
        }

        return product
    }

    async createProduct(productDto: ProductDto){
        
    }
}
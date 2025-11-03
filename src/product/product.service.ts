import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ProductEntity } from "src/entities/product.entity";
import { SubcategoryEntity } from "src/entities/subcategory.entity";
import { ProductDto } from "src/shared/dtos/product.dto";
import { Repository } from "typeorm";

@Injectable()
export class ProductService {
    constructor(
        @InjectRepository(ProductEntity)
        private readonly productRepository: Repository<ProductEntity>,

        @InjectRepository(SubcategoryEntity)
        private readonly subCategoryRepository: Repository<SubcategoryEntity>
    ) {}

    async findProduct(productId: number){
        const product = this.productRepository.findOne({ where: {id: productId}})

        if(!product){
            throw new NotFoundException
        }

        return product
    }

    async createProduct(productDto: ProductDto){
        const subcategory = await this.subCategoryRepository.findOne({ where:{ name: productDto.subcategoryName}})

        if(!subcategory) {
            throw new NotFoundException()
        }

        const newProduct = this.productRepository.create({
            ...productDto,
            subcategory: subcategory
        })

        await this.productRepository.save(newProduct)

        return newProduct
    }
}
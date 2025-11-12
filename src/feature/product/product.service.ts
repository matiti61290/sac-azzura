import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ProductEntity } from "src/entities/product.entity";
import { SubcategoryEntity } from "src/entities/subcategory.entity";
import { AddProductDto } from "src/shared/dtos/product/addProduct.dto";
import { UpdateProductDto } from "src/shared/dtos/product/updateProduct.dto";
import { Repository } from "typeorm";

@Injectable()
export class ProductService {
    constructor(
        @InjectRepository(ProductEntity)
        private readonly productRepository: Repository<ProductEntity>,

        @InjectRepository(SubcategoryEntity)
        private readonly subCategoryRepository: Repository<SubcategoryEntity>
    ) {}

    async getAllProducts(){
        const products = this.productRepository.find()

        if(!products){
            throw new NotFoundException
        }

        return products
    }

    async findProduct(productId: number){
        const product = this.productRepository.findOne({ where: {id: productId}})

        if(!product){
            throw new NotFoundException
        }

        return product
    }

    async createProduct(addProductDto: AddProductDto){
        const subcategory = await this.subCategoryRepository.findOne({ where:{ id: addProductDto.subcategoryId}})

        if(!subcategory) {
            throw new NotFoundException()
        }

        const newProduct = this.productRepository.create({
            ...addProductDto,
            subcategory: subcategory
        })

        await this.productRepository.save(newProduct)

        return newProduct
    }

    async updateProduct(productId: number, updateProductDto: UpdateProductDto){
        const product = await this.productRepository.findOne({ where: {id: productId} })

        if(!product){
            throw new NotFoundException
        }

        if (updateProductDto.subcategoryId) {
            const newSubcategory = await this.subCategoryRepository.findOne({where: {id: updateProductDto.subcategoryId}})

            if(!newSubcategory) {
                throw new NotFoundException
            }

            product.subcategory = newSubcategory
        }

        Object.assign(product, updateProductDto)

        return this.productRepository.save(product)
    }

    async deleteProduct(productId: number) {
        const product = await this.productRepository.findOne({ where: {id: productId}})

        if(!product) {
            throw new NotFoundException
        }

        return this.productRepository.remove(product)
    }
}
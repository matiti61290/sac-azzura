import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ImageEntity } from "src/entities/image.entity";
import { ProductEntity } from "src/entities/product.entity";
import { SubcategoryEntity } from "src/entities/subcategory.entity";
import { AddProductDto } from "src/shared/dtos/product/addProduct.dto";
import { UpdateProductDto } from "src/shared/dtos/product/updateProduct.dto";
import { Repository } from "typeorm";
import { AwsS3Service } from "../aws-s3/aws-s3.service";
import { StockService } from "../stock/stock.service";

@Injectable()
export class ProductService {
    constructor(
        @InjectRepository(ProductEntity)
        private readonly productRepository: Repository<ProductEntity>,

        @InjectRepository(SubcategoryEntity)
        private readonly subCategoryRepository: Repository<SubcategoryEntity>,

        @InjectRepository(ImageEntity)
        private readonly imageRepository: Repository<ImageEntity>,

        private readonly awsS3Service: AwsS3Service,

        private readonly stockService: StockService
    ) {}

    async getAllProducts(){
        const products = await this.productRepository.find({ relations: ["images"]})

        if(!products){
            throw new NotFoundException
        }

        return Promise.all(products.map( async (product) => {
            const imageWithUrls = await Promise.all(
                product.images.map(async (image) => {
                    const signedUrl = await this.awsS3Service.getFileUrl(image.key)
                    return { ...image, url: signedUrl}
                })
            )
            return {...product, images: imageWithUrls}
        }))
    }

    async findProduct(productId: number){
        const product = await this.productRepository.findOne({ where: {id: productId}, relations: ["images"]})

        if(!product){
            throw new NotFoundException
        }

        const imagesWithUrls = await Promise.all(
            product.images.map(async (image) => {
                const signedUrl = await this.awsS3Service.getFileUrl(image.key)
                return { ...image, url: signedUrl}
            })
        )
        return { ...product, images: imagesWithUrls}
    }

    async createProduct(addProductDto: AddProductDto){
        const subcategory = await this.subCategoryRepository.findOne({ where:{ id: addProductDto.subcategoryId}})

        if(!subcategory) {
            throw new NotFoundException()
        }

        const product = this.productRepository.create({
            name: addProductDto.name,
            description: addProductDto.description,
            price: addProductDto.price,
            isActive: true,
            subcategory: subcategory,
            images: []
        })

        const savedProduct = await this.productRepository.save(product)

        const images: ImageEntity[] = []
        for (const file of addProductDto.files) {
            const key = `products/${Date.now()}_${file.originalname}`
            await this.awsS3Service.uploadFile(file, key)
            const image = this.imageRepository.create({ key, product: savedProduct })
            images.push(image)
        }

        await this.imageRepository.save(images)

        await this.stockService.addStock(
            addProductDto.quantity,
            product.id,
            addProductDto.colorId, 
            addProductDto.materialId
        )

        return this.findProduct(savedProduct.id)
    }

    async updateProduct(productId: number, updateProductDto: UpdateProductDto){
        const product = await this.productRepository.findOne({ where: {id: productId}, relations: ['subcategory', 'images'] })
        console.log(product)
        if(!product){
            throw new NotFoundException

        }
        
        Object.assign(product, updateProductDto)
        console.log("Produit mis a jour:", product)
        const updatedProduct = await this.productRepository.save(product)

        const images: ImageEntity[] = []
        for (const file of updateProductDto.files) {
            const key = `products/${Date.now()}_${file.originalname}`
            await this.awsS3Service.uploadFile(file, key)
            const image = this.imageRepository.create({ key, product: updatedProduct })
            images.push(image)
        }
        await this.imageRepository.save(images)

        return this.findProduct(updatedProduct.id)
    }

    async deleteProduct(productId: number) {
        console.log("Le service est appele")
        const product = await this.productRepository.findOne({ where: {id: productId}, relations: ["images"]})
        console.log("Le produit est le suivant:", product)
        if(!product) {
            throw new NotFoundException
        }

        for (const image of product.images) {
            await this.awsS3Service.deleteFile(image.key)
            await this.imageRepository.remove(image)
        }
        
        return this.productRepository.remove(product)
    }
}
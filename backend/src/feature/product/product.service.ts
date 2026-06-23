import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AwsS3Service } from "../aws-s3/aws-s3.service";
import { StockService } from "../stock/stock.service";
import { ImageEntity } from "../../entities/image.entity";
import { ProductEntity } from "../../entities/product.entity";
import { SubcategoryEntity } from "../../entities/subcategory.entity";
import { AddProductDto } from "../../shared/dtos/product/addProduct.dto";
import { UpdateProductDto } from "../../shared/dtos/product/updateProduct.dto";

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
        const products = await this.productRepository.find({ relations: ["images", "stocks", "subcategory", "subcategory.category"]})

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
        const product = await this.productRepository.findOne({ where: {id: productId}, relations: ["images", 'subcategory.category', "stocks", "stocks.color", "stocks.material"]})

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

 // N'oublie pas d'ajouter "variations: any[]" dans les parenthèses
    async createProduct(addProductDto: AddProductDto, files: Express.Multer.File[], variations: any[]) {
        
        // 1. On force l'ID en nombre entier
        const subcategoryId = parseInt(addProductDto.subcategoryId.toString(), 10);
        
        const subcategory = await this.subCategoryRepository.findOne({ 
            where: { id: subcategoryId }
        });

        if(!subcategory) {
            throw new NotFoundException(`Sous-catégorie introuvable avec l'ID ${subcategoryId}`);
        }

        const product = this.productRepository.create({
            name: addProductDto.name,
            description: addProductDto.description,
            // 2. On force le prix en nombre décimal
            price: parseFloat(addProductDto.price.toString()), 
            isActive: true,
            subcategory: subcategory,
            images: [],
            sku_code: addProductDto.sku_code
        })

        const savedProduct = await this.productRepository.save(product)

        const images: ImageEntity[] = []
        if (files && files.length > 0) {
            for (const file of files) {
                const key = `products/${Date.now()}_${file.originalname}`
                await this.awsS3Service.uploadFile(file, key)
                const image = this.imageRepository.create({ key, product: savedProduct })
                images.push(image)
            }
            await this.imageRepository.save(images)
        }

        // Boucle sur le tableau fraîchement décodé
        for (const variation of variations) {
            if (variation.quantity > 0) {
                await this.stockService.addStock(
                    variation.quantity,
                    savedProduct.id,
                    parseInt(variation.colorId),
                    parseInt(variation.materialId),
                    addProductDto.subcategoryId
                )
            }
        }

        return this.findProduct(savedProduct.id)
    }

    async updateProduct(productId: number, updateProductDto: UpdateProductDto){
        const product = await this.productRepository.findOne({ where: {id: productId}, relations: ['subcategory', 'images', 'stocks'] })
        console.log(product)
        if(!product){
            throw new NotFoundException
        }
        
        Object.assign(product, updateProductDto)
        console.log("Produit mis a jour:", product)
        const updatedProduct = await this.productRepository.save(product)

        const images: ImageEntity[] = []
        
        if (updateProductDto.files && updateProductDto.files.length > 0) {
            for (const file of updateProductDto.files) {
                const key = `products/${Date.now()}_${file.originalname}`
                await this.awsS3Service.uploadFile(file, key)
                const image = this.imageRepository.create({ key, product: updatedProduct })
                images.push(image)
            }
            await this.imageRepository.save(images)
        }
        
        if(updateProductDto.quantity !== undefined && updateProductDto.stock_sku !== undefined) {
            await this.stockService.updateStock(updateProductDto.quantity, updateProductDto.stock_sku)
        }

        return this.findProduct(updatedProduct.id)
    }

    async deleteProduct(productId: number) {
        console.log("Le service est appele")
        const product = await this.productRepository.findOne({ where: {id: productId}, relations: ["images", "stocks"]})
        console.log("Le produit est le suivant:", product)
        if(!product) {
            throw new NotFoundException
        }

        for (const image of product.images) {
            await this.awsS3Service.deleteFile(image.key)
            await this.imageRepository.remove(image)
        }

        for (const stock of product.stocks){
            await this.stockService.deleteStockByProductId(stock.sku)
        }

        return this.productRepository.remove(product)
    }
}
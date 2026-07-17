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

/**
 * Service for managing products (CRUD operations, SKU code generation, and image uploads).
 */
@Injectable()
export class ProductService {
    /**
     * Injects repositories and services for product management operations.
     * @param productRepository - The TypeORM repository for all ProductEntity CRUD operations.
     * @param subCategoryRepository - The TypeORM repository for SubcategoryEntity lookups and relations.
     * @param imageRepository - The TypeORM repository for ImageEntity (product image uploads).
     * @param awsS3Service - AWS S3 service for uploading product images to storage.
     * @param stockService - Stock service for managing inventory updates when products are created/updated.
     */
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

    /**
     * Retrieves all products with full relation details and signed S3 URLs for images.
     * @returns An array of ProductEntity instances with populated images (including S3 URLs), 
     * subcategories, stocks, and category relations.
     */
    async getAllProducts(): Promise<ProductEntity[]> {
        const products = await this.productRepository.find({
            relations: ["images", "stocks", "subcategory", "subcategory.category"]
        });

        if (!products || products.length === 0) {
            throw new NotFoundException("Aucun produit trouvé");
        }

        return Promise.all(products.map(async (product) => {
            const imageWithUrls = await Promise.all(
                product.images.map(async (image) => {
                    const signedUrl = await this.awsS3Service.getFileUrl(image.key);
                    return { ...image, url: signedUrl };
                })
            );
            return { ...product, images: imageWithUrls };
        }));
    }

    /**
     * Finds and returns a specific product by its unique ID with complete relation data.
     * @param productId - The unique identifier of the product to retrieve.
     * @returns The ProductEntity with populated images (S3 URLs), subcategory relations, 
     * stocks, color variants, and material information.
     * @throws NotFoundException - If no product exists with the given ID.
     */
    async findProduct(productId: number): Promise<ProductEntity> {
        const product = await this.productRepository.findOne({
            where: { id: productId },
            relations: ["images", 'subcategory.category', "stocks", "stocks.color", "stocks.material"]
        });

        if (!product) {
            throw new NotFoundException(`Produit introuvable avec l'ID ${productId}`);
        }

        const imagesWithUrls = await Promise.all(
            product.images.map(async (image) => {
                const signedUrl = await this.awsS3Service.getFileUrl(image.key);
                return { ...image, url: signedUrl };
            })
        );
        return { ...product, images: imagesWithUrls };
    }

    /**
     * Creates a new product with optional images and initial stock levels.
     * Generates the SKU code from the subcategory and handles S3 uploads for product images.
     * @param addProductDto - The DTO containing product name, description, price, SKU code, and subcategory ID.
     * @param files - Array of file objects for uploading product images to AWS S3.
     * @param variations - Array of stock variation objects specifying quantity, color, and material IDs.
     * @returns The newly created ProductEntity with relations populated (if found).
     * @throws NotFoundException - If the subcategory is not found.
     */
    async createProduct(
        addProductDto: AddProductDto, 
        files: Express.Multer.File[], 
        variations: any[]
    ): Promise<ProductEntity> {

        const subcategoryId = parseInt(addProductDto.subcategoryId.toString(), 10);
        
        const subcategory = await this.subCategoryRepository.findOne({ 
            where: { id: subcategoryId }
        });

        if (!subcategory) {
            throw new NotFoundException(`Sous-catégorie introuvable avec l'ID ${subcategoryId}`);
        }

        const product = this.productRepository.create({
            name: addProductDto.name,
            description: addProductDto.description,
            price: parseFloat(addProductDto.price.toString()), 
            isActive: true,
            subcategory: subcategory,
            images: [],
            sku_code: addProductDto.sku_code
        });

        const savedProduct = await this.productRepository.save(product);

        const images: ImageEntity[] = [];
        if (files && files.length > 0) {
            for (const file of files) {
                const key = `products/${Date.now()}_${file.originalname}`;
                await this.awsS3Service.uploadFile(file, key);
                const image = this.imageRepository.create({ key, product: savedProduct });
                images.push(image);
            }
            await this.imageRepository.save(images);
        }

        for (const variation of variations) {
            if (variation.quantity > 0) {
                await this.stockService.addStock(
                    variation.quantity,
                    savedProduct.id,
                    parseInt(variation.colorId),
                    parseInt(variation.materialId),
                    addProductDto.subcategoryId
                );
            }
        }

        return this.findProduct(savedProduct.id);
    }

    /**
     * Updates an existing product with new data and optionally handles image uploads and stock updates.
     * @param productId - The unique identifier of the product to update.
     * @param updateProductDto - The DTO containing updated product data (name, description, price, isActive).
     * @returns The updated ProductEntity with relations populated.
     * @throws NotFoundException - If no product exists with the given ID.
     */
    async updateProduct(
        productId: number, 
        updateProductDto: UpdateProductDto
    ): Promise<ProductEntity> {
        const product = await this.productRepository.findOne({
            where: { id: productId },
            relations: ['subcategory', 'images', 'stocks']
        });

        if (!product) {
            throw new NotFoundException(`Produit introuvable avec l'ID ${productId}`);
        }
        
        Object.assign(product, updateProductDto);
        const updatedProduct = await this.productRepository.save(product);

        const images: ImageEntity[] = [];
        
        if (updateProductDto.files && updateProductDto.files.length > 0) {
            for (const file of updateProductDto.files) {
                const key = `products/${Date.now()}_${file.originalname}`;
                await this.awsS3Service.uploadFile(file, key);
                const image = this.imageRepository.create({ key, product: updatedProduct });
                images.push(image);
            }
            await this.imageRepository.save(images);
        }
        
        if (updateProductDto.quantity !== undefined && updateProductDto.stock_sku !== undefined) {
            await this.stockService.updateStock(updateProductDto.quantity, updateProductDto.stock_sku);
        }

        return this.findProduct(updatedProduct.id);
    }

    /**
     * Deletes a product from the database and removes all associated resources.
     * Removes images from AWS S3, deletes stock entries, and cleans up related data.
     * @param productId - The unique identifier of the product to delete.
     * @returns Confirmation that the product was deleted.
     * @throws NotFoundException - If no product exists with the given ID.
     */
    async deleteProduct(productId: number) {
        const product = await this.productRepository.findOne({
            where: { id: productId },
            relations: ["images", "stocks"]
        });

        if (!product) {
            throw new NotFoundException(`Produit introuvable avec l'ID ${productId}`);
        }

        for (const image of product.images) {
            await this.awsS3Service.deleteFile(image.key);
            await this.imageRepository.remove(image);
        }

        for (const stock of product.stocks) {
            await this.stockService.deleteStockByProductId(stock.sku);
        }

        return this.productRepository.remove(product);
    }
}
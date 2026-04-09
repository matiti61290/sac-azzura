import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ColorEntity } from "../../entities/color.entity";
import { MaterialEntity } from "../../entities/material.entity";
import { ProductEntity } from "../../entities/product.entity";
import { StockEntity } from "../../entities/stock.entity";
import { SubcategoryEntity } from "../../entities/subcategory.entity";

@Injectable()
export class StockService {
    constructor(
        @InjectRepository(StockEntity)
        private readonly stockRepository: Repository<StockEntity>,

        @InjectRepository(ProductEntity)
        private readonly productRepository: Repository<ProductEntity>,

        @InjectRepository(ColorEntity)
        private readonly colorRepository: Repository<ColorEntity>,

        @InjectRepository(MaterialEntity)
        private readonly materialRepository: Repository<MaterialEntity>,

        @InjectRepository(SubcategoryEntity)
        private readonly subcategoryRepository: Repository<SubcategoryEntity>
    ){}

    async getAllStock (){
        const stocks = await this.stockRepository.find({ relations: ["color", "material", "product"]})

        if(!stocks){
            throw new NotFoundException
        }

        return stocks        
    }

    async getStockBySku(stockSku: string) {
        const stock = await this.stockRepository.findOne({ where: {sku: stockSku}, relations: ["color", "material", "product"]})

        if(!stock){
            throw new NotFoundException
        }

        return stock
    }

    async getStockById(stockId: number){
        const stock =  await this.stockRepository.findOne({where: {id: stockId}, relations: ["color", "material", "product"]})

        if(!stock){
            throw new NotFoundException
        }

        return stock
    }

    async addStock(quantity: number, productId: number, colorId: number, materialId: number, subcategoryId: number){
        const color = await this.colorRepository.findOne({ where: {id: colorId}})
        const material = await this.materialRepository.findOne({ where: {id: materialId}})
        const product = await this.productRepository.findOne({ where: {id: productId}})
        const subcategory = await this.subcategoryRepository.findOne({ where: {id: subcategoryId}, relations: ["category"]})

        if(!color || !material || !product || !subcategory){
            throw new NotFoundException
        }

        

        const colorSkuCode = color.sku_code
        const materialSkuCode = material.sku_code
        const productSkuCode = product.sku_code
        const subcategorySkuCode = subcategory.sku_code
        const categorySkuCode = subcategory.category.sku_code

        const stockSkuCode = productSkuCode + "_" + categorySkuCode + "_" + subcategorySkuCode + "_" + colorSkuCode + "_" + materialSkuCode

        console.log(stockSkuCode)

        const stock = this.stockRepository.create({
           quantity: quantity,
           product: product,
           material: material,
           color: color,
           sku: stockSkuCode
        })
        
        const savedStock = await this.stockRepository.save(stock)

        return this.getStockBySku(savedStock.sku)
    }

    async updateStock(quantity: number, stockSku: string) {
        const stock = await this.stockRepository.findOne({ where: {sku: stockSku}})

        if(!stock){
            throw new NotFoundException
        }

        stock.quantity = quantity
        const updatedStock = await this.stockRepository.save(stock)

        return this.getStockBySku(updatedStock.sku)
    }

    async deleteStockByProductId(stockSku?: string){
        const stock = await this.stockRepository.findOne({ where: {sku: stockSku}})

        if(!stock){
            throw new NotFoundException
        }

        await this.stockRepository.remove(stock)
    }
}
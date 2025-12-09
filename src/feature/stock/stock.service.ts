import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ColorEntity } from "src/entities/color.entity";
import { MaterialEntity } from "src/entities/material.entity";
import { ProductEntity } from "src/entities/product.entity";
import { StockEntity } from "src/entities/stock.entity";
import { Repository } from "typeorm";

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
        private readonly materialRepository: Repository<MaterialEntity>
    ){}

    async getAllStock (){
        const stocks = await this.stockRepository.find({ relations: ["color", "material", "product"]})

        if(!stocks){
            throw new NotFoundException
        }

        return stocks        
    }

    async getStock(stockId: number) {
        const stock = await this.stockRepository.findOne({ where: {id: stockId}, relations: ["color", "material", "product"]})

        if(!stock){
            throw new NotFoundException
        }

        return stock
    }

    async addStock(quantity: number, productId: number, colorId: number, materialId: number){
        const color = await this.colorRepository.findOne({ where: {id: colorId}})
        const material = await this.materialRepository.findOne({ where: {id: materialId}})
        const product = await this.productRepository.findOne({ where: {id: productId}})

        if(!color || !material || !product){
            throw new NotFoundException
        }

        const stock = this.stockRepository.create({
           quantity: quantity,
           product: product,
           material: material,
           color: color 
        })
        
        const savedStock = await this.stockRepository.save(stock)

        return this.getStock(savedStock.id)
    }
}
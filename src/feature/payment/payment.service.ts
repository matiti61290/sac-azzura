import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as dotenv from 'dotenv'
import { ProductEntity } from "src/entities/product.entity";
import { StockEntity } from "src/entities/stock.entity";
import { CartDto } from "src/shared/dtos/payment/cart.dto";
import { ValidatedItem } from "src/shared/interfaces/validatedItem.interface";
import { Stripe } from 'stripe'
import { Repository } from "typeorm";

@Injectable()
export class PaymentService {
    private stripe: Stripe
    constructor(
        @InjectRepository(StockEntity)
        private readonly stockEntity: Repository<StockEntity>,
    ) {
        const secretKey = process.env.SECRET_KEY_STRIPE

        if(!secretKey){
            throw new NotFoundException('Stripe secret key must be defined')
        }

        this.stripe = new Stripe(secretKey)
    }

    async verificationOrder(cartDto: CartDto) {
        let totalAmount = 0
        const validatedItems: ValidatedItem[]= []

        for (const item of cartDto.items){
            const variant = await this.stockEntity.findOne({where: {sku: item.sku}, relations:['product']})

            if(!variant){
                throw new NotFoundException('Aucun produit ne correspond a ce code sku.')
            }
            
            if(!variant.product){
                throw new BadRequestException('Pas de produit associe a ce stock')
            }

            if (variant.quantity < item.quantity){
                throw new BadRequestException('Stock insuffisant')
            }

            const priceInCents = variant.product.price * 100

            totalAmount += priceInCents * item.quantity

            validatedItems.push({
                sku: variant.sku,
                name: variant.product.name,
                price: priceInCents,
                quantity: item.quantity
            })
        }

        return {
            totalAmount,
            items: validatedItems
        }
    }
}
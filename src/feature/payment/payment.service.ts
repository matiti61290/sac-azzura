import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
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

    async verificationOrder(cartDto: CartDto, userId: number) {
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

        console.log("La verification fonctionne")
        return await this.createCheckoutSession(validatedItems, userId)
    }

    async createCheckoutSession (validatedItems, userId: number){
        console.log('Le service de paiement est appele. Voici son contenu:', validatedItems)

        const line_items = validatedItems.map(item => ({
            price_data: {
                currency: 'eur',
                product_data: {
                    name: item.name
                },
                unit_amount: item.price
            },
            quantity: item.quantity
        }))
        console.log("Jusqu'ici, ca marche! aka apres le map")

        try{
            const session = await this.stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: line_items,
                mode: 'payment',
                success_url: 'http://localhost:3000/payment/payment_success',
                cancel_url: 'http://localhost:3000/payment/payment_failed',
                metadata:{
                    user: userId
                }
            })
            console.log(session.url)

            return { url: session.url}
        } catch (error) {
            console.error("Error creating session: ", error)
            throw new InternalServerErrorException('failed to create checkout session')
        }
    }

    async constructEventWebhook (req, res, signature) {
        const endpointSecret = process.env.SECRET_WEBHOOK_KEY

        if(!endpointSecret){
            throw new NotFoundException("Le webhook ne fonctionne pas")
        }
        console.log('le webhook a ete call!!!')
        let event: Stripe.Event

        try{
            event = this.stripe.webhooks.constructEvent(
                req.rawBody,
                signature,
                endpointSecret
            )
        } catch(error){
            return res.status(401).send(`webhook error: ${error.message}`)
        }

        if(event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session
            const metadata = session.metadata
            if(!metadata){
                throw new InternalServerErrorException('Les metadatas n\'existent pas')
            }

            // metadata a determiner
        }
    }
}
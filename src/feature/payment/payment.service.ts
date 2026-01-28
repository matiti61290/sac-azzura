import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as dotenv from 'dotenv'
import { OrderEntity } from "src/entities/order.entity";
import { OrderItemEntity } from "src/entities/orderItem.entity";
import { ProductEntity } from "src/entities/product.entity";
import { StockEntity } from "src/entities/stock.entity";
import { UserEntity } from "src/entities/user.entity";
import { CartDto } from "src/shared/dtos/payment/cart.dto";
import { CartItemDto } from "src/shared/dtos/payment/cartItem.dto";
import { OrderStatus } from "src/shared/enum/order.enum";
import { ValidatedItem } from "src/shared/interfaces/validatedItem.interface";
import { Stripe } from 'stripe'
import { Repository } from "typeorm";

@Injectable()
export class PaymentService {
    private stripe: Stripe
    constructor(
        @InjectRepository(StockEntity)
        private readonly stockRepository : Repository<StockEntity>,

        @InjectRepository(OrderEntity)
        private readonly orderRepository : Repository<OrderEntity>
    ) {
        const secretKey = process.env.SECRET_KEY_STRIPE

        if(!secretKey){
            throw new NotFoundException('Stripe secret key must be defined')
        }

        this.stripe = new Stripe(secretKey)
    }

    async verificationOrder(cartDto: CartDto, user: UserEntity){
        let totalAmount = 0

        const order = new OrderEntity()
        order.user = user
        order.status = OrderStatus.PENDING
        order.items = []

        for (const item of cartDto.items){
            const variant = await this.stockRepository.findOne({where: {sku: item.sku}, relations: ['product']})

            if (!variant){
                throw new NotFoundException("Le variant n'a pas ete trouve")
            }

            if(!variant.product){
                throw new NotFoundException("Le produit n'a pas ete trouve")
            }

            if (variant.quantity < item.quantity){
                throw new BadRequestException('Le stock est inferieur a la quantite commandee')
            }

            const orderItem = new OrderItemEntity()
            orderItem.stock = variant;
            orderItem.quantity = item.quantity
            orderItem.priceAtPurchase = variant.product.price

            order.items.push(orderItem)

            totalAmount += variant.product.price * item.quantity
        }

        order.totalAmount = totalAmount

        const savedOrder = await this.orderRepository.save(order)

        return this.createCheckoutSession(savedOrder.id, user.id, order.items)
    }

    async createCheckoutSession (orderId: number, userId: number, items: OrderItemEntity[]){
        const line_items = items.map(item => {
            if(!item.stock.product?.name){
                throw new InternalServerErrorException('Donnees du produit manquant')
            }

            return{
                            price_data: {
                currency: 'eur',
                product_data: {
                    name : item.stock.product.name,
                    description: `Modele: ${item.stock.sku}`
                },
                unit_amount: Math.round(item.priceAtPurchase * 100)
            },
            quantity: item.quantity
            }

        })

        try{
            const session = await this.stripe.checkout.sessions.create({
                payment_method_types: ["card"],
                line_items,
                mode:'payment',
                success_url: 'http://localhost:3000/payment/payment_success',
                cancel_url: `http://localhost:3000/payment/payment_failed/${orderId}`,

                metadata: {
                    orderId: orderId.toString(),
                    userId: userId.toString()
                }
            })

            return { url: session.url }
        } catch(error) {
            console.error("Error creating session: ", error)
            throw new InternalServerErrorException('failed to create checkout session')
        }
    }


    async constructEventWebhook ( req: any, res: any, signature: string){
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

        if(event.type === 'checkout.session.completed'){
            const session = event.data.object as Stripe.Checkout.Session
            const metadata = session.metadata

            if(!metadata){
                throw new InternalServerErrorException('Les metadatas n\'existent pas')
            }

            const orderId = Number(metadata.orderId)

            const order = await this.orderRepository.findOne({
                where: {id:orderId},
                relations:['items', 'items.stock']
            })

            if(order && order.status=== OrderStatus.PENDING){
                order.status = OrderStatus.PAID
                await this.orderRepository.save(order)
            }

            if(!order){
                throw new InternalServerErrorException()
            }

            for (const line of order.items) {
                line.stock.quantity -= line.quantity
                await this.stockRepository.save(line.stock)
            }

            console.log(`Commande ${orderId} validee et stocks mis a jour!`)
        } else if (event.type ==='checkout.session.expired'){
            const session = event.data.object as Stripe.Checkout.Session
            const metadata = session.metadata

            if(!metadata){
                throw new InternalServerErrorException('Les metadatas n\'existent pas')
            }

            const orderId = Number(metadata.orderId)

            const order = await this.orderRepository.findOne({where: {id: orderId}})

            if(order && order.status === OrderStatus.PENDING){
                order.status = OrderStatus.CANCELLED
                await this.orderRepository.save(order)
            }
        }

        return res.status(200).json({received: true})
    }

    async paymentFailed(orderId: number){
        const order = await this.orderRepository.findOne({where: {id: orderId}})
        console.log('la commande avant la modification:', order)

        if(order && order.status === OrderStatus.PENDING){
            order.status = OrderStatus.CANCELLED
            await this.orderRepository.save(order)
        }

        console.log('la commande mise a jour est:', order)
    }
}
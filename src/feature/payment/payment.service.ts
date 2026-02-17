import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
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
import { DataSource, Repository } from "typeorm";
import { PaymentSuccessMailService } from "./paymentMail/paymentSuccessMail.service";
import { paymentFailMailService } from "./paymentMail/paymentFailMail.service";
import { threadId } from "worker_threads";
import { AddressEntity } from "src/entities/addresses.entity";

@Injectable()
export class PaymentService {
    private stripe: Stripe
    constructor(
        @InjectRepository(StockEntity)
        private readonly stockRepository : Repository<StockEntity>,

        @InjectRepository(OrderEntity)
        private readonly orderRepository : Repository<OrderEntity>,

        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,

        @InjectRepository(AddressEntity)
        private readonly addressRepository: Repository<AddressEntity>,

        private dataSource: DataSource,

        private readonly paymentSuccessMail: PaymentSuccessMailService,

        private readonly paymentFailMail: paymentFailMailService
    ) {
        const secretKey = process.env.SECRET_KEY_STRIPE

        if(!secretKey){
            throw new NotFoundException('Stripe secret key must be defined')
        }

        this.stripe = new Stripe(secretKey)
    }

    async verificationOrder(cartDto: CartDto, user: UserEntity){
        const deliveryAddress = await this.addressRepository.findOneBy({
            id: cartDto.delivery_address_id,
            user: {id: user.id}
        })

        const billingAddress = await this.addressRepository.findOneBy({
            id: cartDto.billing_address_id,
            user: {id: user.id}
        })

        if(!deliveryAddress || !billingAddress){
            throw new InternalServerErrorException("les adresses n'appartiennent pas a cet utilisateur")
        }

        let totalAmount = 0

        const order = new OrderEntity()
        order.user = user
        order.status = OrderStatus.PENDING
        order.items = []
        order.delivery_address = deliveryAddress
        order.billing_address = billingAddress


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
                cancel_url: `http://localhost:3000/payment/payment_failed/${orderId}/${userId}`,

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

        async paymentFailed(orderId: number, userId: number){

        const order = await this.orderRepository.findOne({where:{ id:orderId, user:{id: userId}}, relations: ['user']})

        if(!order){
            throw new ForbiddenException('Cette commande ne vous appartient pas')
        }

        if(order && order.status === OrderStatus.PENDING){
            order.status = OrderStatus.CANCELLED
            await this.orderRepository.save(order)
        }

        console.log('la commande mise a jour est:', order)

        const mail = order.user.mail

        await this.sendMailPaymentFail(orderId, mail)

        
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
            const userId = Number(metadata.userId)

            try{
                await this.dataSource.transaction(async (transactionalEntityManager) => {
                const order = await transactionalEntityManager.findOne(OrderEntity, {
                    where:{id: orderId},
                    relations: ['items', 'items.stock']
                })

                if(!order || order.status !== OrderStatus.PENDING){
                    return
                }

                order.status = OrderStatus.PAID
                await transactionalEntityManager.save(order)

                for(const line of order.items) {
                    const currentStock = line.stock

                    if(currentStock.quantity < line.quantity) {
                        throw new InternalServerErrorException(`Stock insuffisant pour l'item ${currentStock.sku}`)
                    }

                    currentStock.quantity -= line.quantity
                    await transactionalEntityManager.save(currentStock)

                    console.log(`Transaction reussie. Commande ${orderId} payee et stock deduits.`)

                    const user = await this.userRepository.findOne({ where: {id: userId}})

                    if(!user){
                        throw new InternalServerErrorException(`L'utilisateur avec l'id ${userId} n'existe pas`)
                    }
                    const mail = user.mail
                    await this.sendMailPaymentSuccess(mail, orderId)
                }
            })
            } catch(error){
                console.error('Echec de la transaction')
            }

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

    async sendMailPaymentSuccess(mail: string, orderId: number){
        return this.paymentSuccessMail.sendPaymentSuccessMail(mail, orderId)
    }

    async sendMailPaymentFail(orderId: number, mail: string){
        return this.paymentFailMail.sendPaymentFailMail(orderId, mail)
    }
}
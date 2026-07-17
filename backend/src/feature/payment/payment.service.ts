import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Stripe } from 'stripe';
import { DataSource, Repository } from "typeorm";
import { PaymentSuccessMailService } from "./paymentMail/paymentSuccessMail.service";
import { paymentFailMailService } from "./paymentMail/paymentFailMail.service";
import { OrderEntity } from "../../entities/order.entity";
import { OrderItemEntity } from "../../entities/OrderItem.entity";
import { StockEntity } from "../../entities/stock.entity";
import { UserEntity } from "../../entities/user.entity";
import { CartDto } from "../../shared/dtos/payment/cart.dto";
import { OrderStatus } from "../../shared/enum/order.enum";
import { AddressEntity } from "../../entities/addresses.entity";
import { PromotionEntity } from "../../entities/promotion.entity";

/**
 * Service for handling payment processing with Stripe integration.
 * Manages checkout sessions, webhook events, and email notifications.
 */
@Injectable()
export class PaymentService {
    private stripe: Stripe;

    /**
     * Injects all required repositories and services for payment operations.
     * Initializes the Stripe client with the configured secret key.
     * @param stockRepository - Repository for managing stock entity lookups and updates.
     * @param orderRepository - Repository for all order CRUD operations and status management.
     * @param userRepository - Repository for user entity verification and data retrieval.
     * @param addressRepository - Repository for billing and delivery address validation.
     * @param promotionRepository - Repository for promotion code lookup and validation.
     * @param dataSource - TypeORM DataSource for transactional operations during webhook handling.
     * @param paymentSuccessMail - Mail service for sending successful payment confirmation emails.
     * @param paymentFailMail - Mail service for sending failed payment notification emails.
     */
    constructor(
        @InjectRepository(StockEntity)
        private readonly stockRepository: Repository<StockEntity>,

        @InjectRepository(OrderEntity)
        private readonly orderRepository: Repository<OrderEntity>,

        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,

        @InjectRepository(AddressEntity)
        private readonly addressRepository: Repository<AddressEntity>,

        @InjectRepository(PromotionEntity)
        private readonly promotionRepository: Repository<PromotionEntity>,

        private dataSource: DataSource,

        private readonly paymentSuccessMail: PaymentSuccessMailService,

        private readonly paymentFailMail: paymentFailMailService
    ) {
        const secretKey = process.env.SECRET_KEY_STRIPE;

        if (!secretKey) {
            throw new NotFoundException('Stripe secret key must be defined');
        }

        this.stripe = new Stripe(secretKey);
    }

    /**
     * Verifies the order and creates a Stripe checkout session.
     * Validates user account status, addresses, stock availability, and applies promotions.
     * @param cartDto - The DTO containing items, SKUs, quantities, and address IDs for the cart.
     * @param user - The UserEntity representing the authenticated user making the purchase.
     * @returns An object containing the Stripe payment session URL for redirecting the customer.
     * @throws NotFoundException - If user not found, variant/stock not found, product not found, or stock insufficient.
     * @throws ForbiddenException - If user account is not verified.
     * @throws BadRequestException - If promotion code is invalid or minimum amount not reached.
     */
    async verificationOrder(cartDto: CartDto, user: UserEntity) {
        const currentUser = await this.userRepository.findOneBy({ id: user.id });

        if (!currentUser) {
            throw new NotFoundException("Utilisateur introuvable");
        }

        if (!currentUser.isVerified) {
            throw new ForbiddenException("Votre compte doit être vérifié pour effectuer un achat.");
        }

        const deliveryAddress = await this.addressRepository.findOneBy({
            id: cartDto.delivery_address_id,
            user: { id: user.id }
        });

        const billingAddress = await this.addressRepository.findOneBy({
            id: cartDto.billing_address_id,
            user: { id: user.id }
        });

        if (!deliveryAddress || !billingAddress) {
            throw new InternalServerErrorException("Les adresses n'appartiennent pas à cet utilisateur");
        }

        let totalAmount = 0;

        const order = new OrderEntity();
        order.user = user;
        order.status = OrderStatus.PENDING;
        order.items = [];
        order.delivery_address = deliveryAddress;
        order.billing_address = billingAddress;

        for (const item of cartDto.items) {
            const variant = await this.stockRepository.findOne({ where: { sku: item.sku }, relations: ['product'] });

            if (!variant) {
                throw new NotFoundException("Le produit n'a pas été trouvé");
            }

            if (!variant.product) {
                throw new NotFoundException("Le produit n'a pas été trouvé");
            }

            if (variant.quantity < item.quantity) {
                throw new BadRequestException('Le stock est inférieur à la quantité commandée');
            }

            const orderItem = new OrderItemEntity();
            orderItem.stock = variant;
            orderItem.quantity = item.quantity;
            orderItem.priceAtPurchase = variant.product.price;

            order.items.push(orderItem);

            totalAmount += variant.product.price * item.quantity;
        }

        // Promotion code management ready to be implemented in the frontend
        if (cartDto.promotion_code && cartDto.promotion_code !== "AUCUN" && cartDto.promotion_code.trim() !== "") {
            const promotionCode = await this.promotionRepository.findOne({ where: { name: cartDto.promotion_code } });

            if (!promotionCode) {
                throw new BadRequestException("Le code de promotion renseigné n'existe pas ou a expiré");
            }

            if (promotionCode.minAmount >= totalAmount) {
                throw new BadRequestException("Vous n'avez pas atteint la valeur minimum pour utiliser ce code promotionnel")
            } else {
                if (promotionCode.promotionType === "percentage") {
                    const promotionValue = promotionCode.percentageValue;
                    totalAmount = totalAmount - (totalAmount * promotionValue) / 100;
                } else if (promotionCode.promotionType === 'fixed_amount') {
                    const promotionValue = promotionCode.fixedValue;
                    totalAmount = totalAmount - promotionValue;
                }
            }
        }

        order.totalAmount = totalAmount;

        const savedOrder = await this.orderRepository.save(order);

        return this.createCheckoutSession(savedOrder.id, currentUser.id, order.items, currentUser.mail);
    }

    /**
     * Creates a Stripe checkout session for payment processing.
     * Constructs line items from order products with pricing and metadata.
     * @param orderId - The unique identifier of the created order.
     * @param userId - The ID of the user associated with this order.
     * @param items - Array of OrderItemEntity representing items in the cart.
     * @param userEmail - The email address of the customer for checkout metadata.
     * @returns An object containing the URL to redirect the customer to complete payment.
     * @throws InternalServerErrorException - If product data is missing during line item construction.
     */
    async createCheckoutSession(orderId: number, userId: number, items: OrderItemEntity[], userEmail: string) {
        const line_items = items.map(item => {
            if (!item.stock.product?.name) {
                throw new InternalServerErrorException('Données du produit manquantes')
            }

            return {
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: item.stock.product.name,
                        description: `Modèle: ${item.stock.sku}`
                    },
                    unit_amount: Math.round(item.priceAtPurchase * 100)
                },
                quantity: item.quantity
            }
        });

        try {
            const session = await this.stripe.checkout.sessions.create({
                payment_method_types: ["card"],
                line_items,
                mode: 'payment',
                customer_email: userEmail,
                success_url: 'http://localhost:3000/payment/payment_success',
                cancel_url: `http://localhost:3000/payment/payment_failed/${orderId}/${userId}`,

                metadata: {
                    orderId: orderId.toString(),
                    userId: userId.toString()
                }
            });

            return { url: session.url };
        } catch (error) {
            console.error("Error creating session: ", error);
            throw new InternalServerErrorException('failed to create checkout session');
        }
    }

    /**
     * Handles failed payment events by cancelling pending orders and sending notifications.
     * Updates order status to cancelled and triggers failure email notification.
     * @param orderId - The unique identifier of the failed payment order.
     * @param userId - The ID of the user who attempted the purchase.
     * @throws ForbiddenException - If the order does not belong to the requesting user.
     */
    async paymentFailed(orderId: number, userId: number) {
        const order = await this.orderRepository.findOne({ where: { id: orderId, user: { id: userId } }, relations: ['user'] });

        if (!order) {
            throw new ForbiddenException('Cette commande ne vous appartient pas');
        }

        if (order && order.status === OrderStatus.PENDING) {
            order.status = OrderStatus.CANCELLED;
            await this.orderRepository.save(order);
        }

        console.log('la commande mise a jour est:', order);

        const mail = order.user.mail;
        await this.sendMailPaymentFail(orderId, mail);
    }

    /**
     * Validates and processes Stripe webhook events for payment completion.
     * Handles checkout session completed (payment success), expired sessions (payment cancelled).
     * Updates orders, decrements stock, and sends appropriate email notifications via transactions.
     * @param req - The incoming request object from Stripe webhook.
     * @param res - The response object for sending HTTP responses.
     * @param signature - The signature header from the request for webhook authentication.
     * @throws InternalServerErrorException - If metadata is missing or transaction fails.
     */
    async constructEventWebhook(req: any, res: any, signature: string) {
        const endpointSecret = process.env.SECRET_WEBHOOK_KEY;
        if (!endpointSecret) {
            throw new NotFoundException("Le webhook ne fonctionne pas");
        }

        let event: Stripe.Event;
        try {
            event = this.stripe.webhooks.constructEvent(
                req.rawBody,
                signature,
                endpointSecret
            );
        } catch (error) {
            if (error instanceof Error) {
                return res.status(401).send(`webhook error: ${error.message}`);
            } else {
                return res.status(500).send('An unknown error occurred');
            }
        }

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;
            const metadata = session.metadata;

            if (!metadata) {
                throw new InternalServerErrorException('Les métadonnées n\'existent pas');
            }

            const orderId = Number(metadata.orderId);
            const userId = Number(metadata.userId);

            try {
                await this.dataSource.transaction(async (transactionalEntityManager) => {
                    const order = await transactionalEntityManager.findOne(OrderEntity, {
                        where: { id: orderId },
                        relations: ['items', 'items.stock']
                    });

                    if (!order || order.status !== OrderStatus.PENDING) {
                        return;
                    }

                    order.status = OrderStatus.PAID;
                    await transactionalEntityManager.save(order);

                    for (const line of order.items) {
                        const currentStock = line.stock;

                        if (currentStock.quantity < line.quantity) {
                            throw new InternalServerErrorException(`Stock insuffisant pour l'item ${currentStock.sku}`)
                        }

                        currentStock.quantity -= line.quantity;
                        await transactionalEntityManager.save(currentStock);

                        console.log(`Transaction réussie. Commande ${orderId} payée et stock déduits.`);
                    }
                    const user = await this.userRepository.findOne({ where: { id: userId } });

                    if (!user) {
                        throw new InternalServerErrorException(`L'utilisateur avec l'id ${userId} n'existe pas`);
                    }
                    const mail = user.mail;
                    await this.sendMailPaymentSuccess(mail, orderId);
                });
            } catch (error) {
                console.error('Échec de la transaction');
            }

        } else if (event.type === 'checkout.session.expired') {
            const session = event.data.object as Stripe.Checkout.Session;
            const metadata = session.metadata;

            if (!metadata) {
                throw new InternalServerErrorException('Les métadonnées n\'existent pas');
            }

            const orderId = Number(metadata.orderId);
            const order = await this.orderRepository.findOne({ where: { id: orderId } });

            if (order && order.status === OrderStatus.PENDING) {
                order.status = OrderStatus.CANCELLED;
                await this.orderRepository.save(order);
            }
        }

        return res.status(200).json({ received: true });
    }

    /**
     * Sends a success email notification to the customer after payment completion.
     * @param mail - The email address of the successful customer.
     * @param orderId - The ID of the completed order for receipt details.
     */
    async sendMailPaymentSuccess(mail: string, orderId: number) {
        return this.paymentSuccessMail.sendPaymentSuccessMail(mail, orderId);
    }

    /**
     * Sends a failure email notification to the customer after payment cancellation.
     * @param orderId - The ID of the failed order for receipt details.
     * @param mail - The email address of the affected customer.
     */
    async sendMailPaymentFail(orderId: number, mail: string) {
        return this.paymentFailMail.sendPaymentFailMail(orderId, mail);
    }
}
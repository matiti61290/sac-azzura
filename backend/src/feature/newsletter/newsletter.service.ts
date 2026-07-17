import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriberEntity } from '../../entities/subscriber.entity';
import * as crypto from 'crypto';
import { SubscriptionConfirmMail } from './subscriptionMail/confirmMail.service';

/**
 * Service for managing newsletter subscribers.
 */
@Injectable()
export class NewsletterService {
    /**
     * Injects the TypeORM repository for SubscriberEntity operations and mail service.
     * @param subscriberEntity The repository instance for all subscriber CRUD operations.
     * @param mailService - Mail service for sending subscription confirmation emails.
     */
    constructor(
        @InjectRepository(SubscriberEntity)
        private readonly subscriberEntity: Repository<SubscriberEntity>,
        private readonly mailService: SubscriptionConfirmMail,
    ) {}

    /**
     * Subscribes a new email address to the newsletter.
     * Generates a verification token and sends a confirmation email.
     * @param email - The email address to subscribe.
     * @throws ConflictException - If the email is already verified or subscribed.
     */
    async subscribe(email: string): Promise<void> {
        const existing = await this.subscriberEntity.findOne({ where: { email } });

        if (existing) {
            if (existing.isVerified) {
                throw new ConflictException('Cet email est déjà inscrit.');
            }
            existing.verifyToken = crypto.randomBytes(32).toString('hex');
            await this.subscriberEntity.save(existing);
            
            await this.mailService.sendSubscriptionConfirmMail(existing.email, existing.verifyToken);
            return;
        }

        const token = crypto.randomBytes(32).toString('hex');
        const newSubscriber = this.subscriberEntity.create({
            email,
            verifyToken: token,
        });

        await this.subscriberEntity.save(newSubscriber);
        await this.mailService.sendSubscriptionConfirmMail(email, token);
    }

    /**
     * Verifies a subscriber using their verification token.
     * Activates the subscription by marking them as verified.
     * @param token - The verification token sent via email.
     * @returns Success message when verification is complete.
     * @throws NotFoundException - If the token is invalid or expired.
     */
    async verify(token: string): Promise<string> {
        const subscriber = await this.subscriberEntity.findOne({ where: { verifyToken: token } });

        if (!subscriber) {
            throw new NotFoundException('Lien de validation invalide ou expiré.');
        }

        subscriber.isVerified = true;
        subscriber.verifyToken = null;
        await this.subscriberEntity.save(subscriber);

        return 'Votre inscription est confirmée !';
    }
}
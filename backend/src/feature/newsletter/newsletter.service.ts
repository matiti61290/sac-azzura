import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriberEntity } from '../../entities/subscriber.entity';
import * as crypto from 'crypto';
import { SubscriptionConfirmMail } from './subscriptionMail/confirmMail.service'; // Ajoute le bon chemin

@Injectable()
export class NewsletterService {
  constructor(
    @InjectRepository(SubscriberEntity)
    private subscriberEntity: Repository<SubscriberEntity>,
    private mailService: SubscriptionConfirmMail, // <-- Injection de ton service Mail
  ) {}

  async subscribe(email: string): Promise<void> {
    const existing = await this.subscriberEntity.findOne({ where: { email } });

    if (existing) {
      if (existing.isVerified) {
        throw new ConflictException('Cet email est déjà inscrit.');
      }
      existing.verifyToken = crypto.randomBytes(32).toString('hex');
      await this.subscriberEntity.save(existing);
      
      // <-- Appel de ton service Mail
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
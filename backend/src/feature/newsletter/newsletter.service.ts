import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriberEntity } from '../../entities/subscriber.entity';

@Injectable()
export class NewsletterService {
  constructor(
    @InjectRepository(SubscriberEntity)
    private subscriberRepo: Repository<SubscriberEntity>,
  ) {}
}
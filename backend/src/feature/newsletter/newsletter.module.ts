import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SubscriberEntity } from "../../entities/subscriber.entity";
import { NewsletterService } from "./newsletter.service";
import { NewsletterController } from "./newsletter.controller";
import { SubscriptionConfirmMail } from "./subscriptionMail/confirmMail.service";

@Module({
    imports: [TypeOrmModule.forFeature([SubscriberEntity])],
    controllers: [NewsletterController],
    providers: [NewsletterService, SubscriptionConfirmMail]
})

export class NewsletterModule {}

console.log("Forcer la compilation de :", SubscriberEntity.name);
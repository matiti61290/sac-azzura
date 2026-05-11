import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SubscriberEntity } from "../../entities/subscriber.entity";
import { NewsletterService } from "./newsletter.service";

@Module({
    imports: [TypeOrmModule.forFeature([SubscriberEntity])],
    providers: [NewsletterService]
})

export class NewsletterModule {}

console.log("Forcer la compilation de :", SubscriberEntity.name);
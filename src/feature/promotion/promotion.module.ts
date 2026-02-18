import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PromotionEntity } from "src/entities/promotion.entity";
import { PromotionService } from "./promotion.service";
import { PromotionController } from "./promotion.controller";

@Module({
    imports: [TypeOrmModule.forFeature([PromotionEntity])],
    controllers: [PromotionController],
    providers: [PromotionService]
})

export class PromotionModule {}
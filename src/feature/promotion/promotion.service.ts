import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PromotionEntity } from "src/entities/promotion.entity";
import { Repository } from "typeorm";

@Injectable()
export class PromotionService{
    constructor(
        @InjectRepository(PromotionEntity)
        private readonly promotionRepository: Repository<PromotionEntity>
    ) {}

    async getAllPromotion(){
        const promotions = await this.promotionRepository.find()

        return promotions
    }

    async getPromotionById(promotionId: number){
        const promotion = await this.promotionRepository.findOne({where: {id: promotionId}})

        return promotion
    }
}
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PromotionEntity } from "src/entities/promotion.entity";
import { AddPromotionDto } from "src/shared/dtos/promotion/addPromotion.dto";
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

    async addPromotion(addPromotionDto: AddPromotionDto){

        if(addPromotionDto.percentageValue && addPromotionDto.fixedValue){
            throw new InternalServerErrorException('La promotion doit avoir une valeur en pourcentage ou fixe.')
        }

        if(addPromotionDto.startdate > addPromotionDto.enddate) {
            throw new InternalServerErrorException('La date de debut ne peut pas etre apres la date de fin')
        }
        const newPromotion = await this.promotionRepository.create({
            ...addPromotionDto
        })

        await this.promotionRepository.save(newPromotion)

        return ('It worked')
    }
}
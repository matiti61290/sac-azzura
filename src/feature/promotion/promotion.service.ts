import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PromotionEntity } from "src/entities/promotion.entity";
import { AddPromotionDto } from "src/shared/dtos/promotion/addPromotion.dto";
import { CheckPromotionCodeDto } from "src/shared/dtos/promotion/checkPromotionCode.dto";
import { UpdatePromotionDto } from "src/shared/dtos/promotion/updatePromotion.dto";
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

    async checkPromotionCode(checkPromotionCodeDto: CheckPromotionCodeDto){
        const promotionCode = await this.promotionRepository.findOne({ where:{name: checkPromotionCodeDto.promotion_code}})

        if(!promotionCode){
            return "Ce code n'existe pas"
        } else {
            return "Le code existe"
        }
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

    async updatePromotion (promotionId: number, updatePromotionDto: UpdatePromotionDto) {
        const promotion = await this.promotionRepository.findOne({ where: {id: promotionId}})

        if(!promotion){
            throw new NotFoundException("La promotion n'existe pas")
        }

        let updatedPromotion: any = updatePromotionDto

        if(updatePromotionDto.promotionType === "fixed_amount"){
            updatedPromotion.percentageValue = null
        }

        if(updatePromotionDto.promotionType === "percentage"){
            updatedPromotion.fixedValue = null
        }

        await this.promotionRepository.update(promotionId, updatedPromotion)

        return { promotion, updatedPromotion}
    }

    async deletePromotion(promotionId: number) {
        const promotion = await this.promotionRepository.findOne({ where: {id: promotionId}})

        if(!promotion){
            throw new NotFoundException("Pas de promotion trouvee")
        }

        await this.promotionRepository.remove(promotion)
    }
}
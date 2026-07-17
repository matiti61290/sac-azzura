import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PromotionEntity } from "../../entities/promotion.entity";
import { AddPromotionDto } from "../../shared/dtos/promotion/addPromotion.dto";
import { CheckPromotionCodeDto } from "../../shared/dtos/promotion/checkPromotionCode.dto";
import { UpdatePromotionDto } from "../../shared/dtos/promotion/updatePromotion.dto";

/**
 * Service for managing promotional codes (CRUD operations and code validation).
 * 
 */

@Injectable()
export class PromotionService {
    /**
     * Injects the repository for all PromotionEntity CRUD operations.
     * @param promotionRepository - The TypeORM repository for promotion entity management.
     */
    constructor(
        @InjectRepository(PromotionEntity)
        private readonly promotionRepository: Repository<PromotionEntity>
    ) {}

    /**
     * Retrieves all active promotions from the database.
     * @returns An array of PromotionEntity instances representing all available promotional codes.
     */
    async getAllPromotion(): Promise<PromotionEntity[]> {
        const promotions = await this.promotionRepository.find();
        return promotions;
    }

    /**
     * Finds and returns a specific promotion by its unique ID.
     * @param promotionId - The unique identifier of the promotion to retrieve.
     * @returns The PromotionEntity with all relations populated if found.
     * @throws NotFoundException - If no promotion exists with the given ID.
     */
    async getPromotionById(promotionId: number): Promise<PromotionEntity> {
        const promotion = await this.promotionRepository.findOne({ where: { id: promotionId } });

        if (!promotion) {
            throw new NotFoundException("La promotion n'existe pas");
        }

        return promotion;
    }

    /**
     * Validates a promotional code against the provided order amount.
     * Checks if the code exists and verifies that the minimum amount requirement is met.
     * @param checkPromotionCodeDto - DTO containing the promotion code and total order amount.
     * @returns The validation result: null if code doesn't exist, a message about minimum amount not met,
     * or undefined if the code is valid and ready to use.
     * @throws NotFoundException - If the promotion code doesn't exist.
     */
    async checkPromotionCode(checkPromotionCodeDto: CheckPromotionCodeDto): Promise<string | null | undefined> {
        const promotionCode = await this.promotionRepository.findOne({ 
            where: { name: checkPromotionCodeDto.promotion_code } 
        });

        if (!promotionCode) {
            return "Ce code n'existe pas";
        } else if (promotionCode.minAmount > checkPromotionCodeDto.totalAmount) {
            return "La valeur minimale n'est pas atteinte";
        }

        return undefined;
    }

    /**
     * Creates a new promotion with the provided details.
     * Validates that only one value type (percentage or fixed) is provided and that dates are valid.
     * @param addPromotionDto - DTO containing promotion name, code, type, values, start date, and end date.
     * @returns A confirmation message indicating successful creation.
     * @throws InternalServerErrorException - If both percentageValue and fixedValue are provided, or if dates are invalid.
     */
    async addPromotion(addPromotionDto: AddPromotionDto): Promise<string> {
        if (addPromotionDto.percentageValue && addPromotionDto.fixedValue) {
            throw new InternalServerErrorException('La promotion doit avoir une valeur en pourcentage ou fixe.');
        }

        if (addPromotionDto.startdate > addPromotionDto.enddate) {
            throw new InternalServerErrorException('La date de debut ne peut pas etre apres la date de fin');
        }
        
        const newPromotion = this.promotionRepository.create({
            ...addPromotionDto
        });

        await this.promotionRepository.save(newPromotion);

        return 'It worked';
    }

    /**
     * Updates an existing promotion with new details.
     * Clears the opposite value field based on the promotion type (percentage vs fixed_amount).
     * @param promotionId - The unique identifier of the promotion to update.
     * @param updatePromotionDto - DTO containing updated promotion details.
     * @returns An object containing the original and updated promotion entities.
     * @throws NotFoundException - If the promotion with the given ID doesn't exist.
     */
    async updatePromotion(promotionId: number, updatePromotionDto: UpdatePromotionDto): Promise<{ promotion: PromotionEntity; updatedPromotion: any }> {
        const promotion = await this.promotionRepository.findOne({ where: { id: promotionId } });

        if (!promotion) {
            throw new NotFoundException("La promotion n'existe pas");
        }

        let updatedPromotion: any = updatePromotionDto;

        if (updatePromotionDto.promotionType === "fixed_amount") {
            updatedPromotion.percentageValue = null;
        }

        if (updatePromotionDto.promotionType === "percentage") {
            updatedPromotion.fixedValue = null;
        }

        await this.promotionRepository.update(promotionId, updatedPromotion);

        return { promotion, updatedPromotion };
    }

    /**
     * Permanently deletes a promotion from the database.
     * @param promotionId - The unique identifier of the promotion to delete.
     * @throws NotFoundException - If the promotion with the given ID doesn't exist.
     */
    async deletePromotion(promotionId: number) {
        const promotion = await this.promotionRepository.findOne({ where: { id: promotionId } });

        if (!promotion) {
            throw new NotFoundException("Pas de promotion trouvee");
        }

        await this.promotionRepository.remove(promotion);
    }
}
import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { PromotionService } from "./promotion.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdminGuard } from "../auth/guards/admin.guard";
import { AddPromotionDto } from "src/shared/dtos/promotion/addPromotion.dto";
import { UpdatePromotionDto } from "src/shared/dtos/promotion/updatePromotion.dto";
import { CheckPromotionCodeDto } from "src/shared/dtos/promotion/checkPromotionCode.dto";

@Controller('promotions')
export class PromotionController {
    constructor(
        private readonly promotionService : PromotionService
    ) {}

    @Get('')
    @UseGuards(JwtAuthGuard, AdminGuard)
    async getAllPromotion(){
        return this.promotionService.getAllPromotion()
    }

    @Get('/:promotionId')
    @UseGuards(JwtAuthGuard, AdminGuard)
    async getPromotionById(
        @Param('promotionId', ParseIntPipe) promotionId: number
    ) {
        return this.promotionService.getPromotionById(promotionId)
    }
    
    @Post('/check-promotion')
    @UseGuards(JwtAuthGuard)
    async checkPromotionCode(
        @Body() checkPromotionCodeDto: CheckPromotionCodeDto
    ){
        return this.promotionService.checkPromotionCode(checkPromotionCodeDto)
    }

    @Post('/create-promotion')
    @UseGuards(JwtAuthGuard, AdminGuard)
    async createPromotion(
        @Body() addPromotionDto: AddPromotionDto
    ) {
        return this.promotionService.addPromotion(addPromotionDto)
    }

    @Patch('/update-promotion/:promotionId')
    @UseGuards(JwtAuthGuard, AdminGuard)
    async updatePromotion(
        @Param('promotionId', ParseIntPipe) promotionId: number,
        @Body() updatePromotionDto: UpdatePromotionDto
    ) {
        return this.promotionService.updatePromotion(promotionId, updatePromotionDto)
    }

    @Post('Delete-promotion/:promotionId')
    @UseGuards(JwtAuthGuard, AdminGuard)
    async deletePromotion(
        @Param('promotionId',ParseIntPipe) promotionId: number
    ){
        this.promotionService.deletePromotion(promotionId)
    }
}
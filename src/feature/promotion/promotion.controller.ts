import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from "@nestjs/common";
import { PromotionService } from "./promotion.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdminGuard } from "../auth/guards/admin.guard";
import { AddPromotionDto } from "src/shared/dtos/promotion/addPromotion.dto";

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

    @Get('/promotionId')
    @UseGuards(JwtAuthGuard, AdminGuard)
    async getPromotionById(
        @Param('promotionId', ParseIntPipe) promotionId: number
    ) {
        return this.promotionService.getPromotionById(promotionId)
    }

    @Post('/create-promotion')
    @UseGuards(JwtAuthGuard, AdminGuard)
    async createPromotion(
        @Body() addPromotionDto: AddPromotionDto
    ) {
        return this.promotionService.addPromotion(addPromotionDto)
    }
}
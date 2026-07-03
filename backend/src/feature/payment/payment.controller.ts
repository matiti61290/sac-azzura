import { Body, Controller, Get, Param,  Headers, HttpCode, HttpStatus, ParseIntPipe, Post, Req, Res, UseGuards } from "@nestjs/common";
import { PaymentService } from "./payment.service";
import type { Request, Response } from "express";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CartDto } from "../../shared/dtos/payment/cart.dto";

@Controller('payment')
export class PaymentController {

    constructor(
        private readonly paymentService: PaymentService
    ) {}

    @UseGuards(JwtAuthGuard)
    @Post('')
    async checkoutSession(
        @Body() cartDto: CartDto,
        @Req() req
    ){
        const user = req.user
        console.log("L'id de l'user est:", user)
        return this.paymentService.verificationOrder(cartDto, user)
    }

    //Rework planned with frontend
    @Get('payment_failed/:orderId/:userId')
    async paymentFailed(
        @Param('orderId', ParseIntPipe) orderId: number,
        @Param('userId', ParseIntPipe) userId: number
    ) {
        await this.paymentService.paymentFailed(orderId, userId)

        return "la commande a echoué"
    }

    @Post('webhook')
    @HttpCode(HttpStatus.OK)
    async handleStripeWebhook(
        @Req() req: Request,
        @Res() res: Response,
        @Headers('stripe-signature') signature: string
    ){
        return this.paymentService.constructEventWebhook(req, res, signature)
    }
}
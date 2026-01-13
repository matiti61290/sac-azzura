import { Body, Controller, Get, Headers, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from "@nestjs/common";
import { PaymentService } from "./payment.service";
import { CartDto } from "src/shared/dtos/payment/cart.dto";
import type { Request, Response } from "express";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

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
        const userId = user.id
        console.log("L'id de l'user est:", userId)
        return this.paymentService.verificationOrder(cartDto, userId)
    }

    @Get('payment_success')
    async paymentSuccess(){
        return "Youhou. Ca marche"
    }

    @Get('payment-failed')
    async paymentFailed() {
        return "Fuck. Ca marche pas"
    }

    @Post('webhook')
    @HttpCode(HttpStatus.OK)
    async handleStripeWebhook(
        @Req() req: Request,
        @Res() res: Response,
        @Headers('stripe-signature') signature: string
    ){
        console.log("le controller webhook est appele")
        return this.paymentService.constructEventWebhook(req, res, signature)
    }
}
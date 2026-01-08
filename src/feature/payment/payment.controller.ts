import { Body, Controller, Get, Post } from "@nestjs/common";
import { PaymentService } from "./payment.service";
import { CartDto } from "src/shared/dtos/payment/cart.dto";

@Controller('payment')
export class PaymentController {

    constructor(
        private readonly paymentService: PaymentService
    ) {}

    @Post('')
    async checkoutSession(
        @Body() cartDto: CartDto
    ){
        return this.paymentService.verificationOrder(cartDto)
    }

    @Get('payment_success')
    async paymentSuccess(){
        return "Youhou. Ca marche"
    }

    @Get('paymentg-failed')
    async paymentFailed() {
        return "Fuck. Ca marche pas"
    }

    @Post('webhook')
    async handleStripeWebhook(){
        
    }
}
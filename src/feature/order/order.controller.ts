import { Controller, Get, Param, ParseIntPipe } from "@nestjs/common";
import { OrderService } from "./order.service";

@Controller('orders')
export class OrderController {
constructor(
    private readonly orderService: OrderService
) {}
    @Get('')
    async getAllOrder() {
        return this.orderService.getAllOrder()
    }

    @Get('/:orderId')
    async getOrderById(
        @Param('orderId', ParseIntPipe) orderId: number
    ) {
        return this.orderService.getOrderById(orderId)
    }
}
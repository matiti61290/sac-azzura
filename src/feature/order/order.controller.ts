import { Body, Controller, Get, Param, ParseIntPipe, Patch } from "@nestjs/common";
import { OrderService } from "./order.service";
import { UpdateOrderStatusDto } from "src/shared/dtos/order/updateOrderStatus.dto";

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

    @Patch("/:orderId/:status")
    async updateStatus(
        @Param('orderId', ParseIntPipe) orderId: number,
        @Body() updateOrderStatusDto: UpdateOrderStatusDto
    ){
        return this.orderService.updateStatus(orderId, updateOrderStatusDto)
    }
}
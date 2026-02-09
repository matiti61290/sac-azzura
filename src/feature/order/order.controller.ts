import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Req } from "@nestjs/common";
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

    @Get('user/orders')
    async getOrdersByUser(
        @Req() req
    ){
        const user = req.user
        return this.orderService.getOrdersByUser(user)
    }

    @Get('/:orderId')
    async getOrderById(
        @Param('orderId', ParseIntPipe) orderId: number
    ) {
        return this.orderService.getOrderById(orderId)
    }

    @Get("/user/orders/:orderId")
    async GetOrderByIdByUser(
        @Req() req,
        @Param('orderId', ParseIntPipe) orderId: number
    ){
        const user = req.user
        return this.orderService.getOrderByIdByUser(user, orderId)
    }

    @Patch("/:orderId")
    async updateStatus(
        @Param('orderId', ParseIntPipe) orderId: number,
        @Body() updateOrderStatusDto: UpdateOrderStatusDto
    ){
        return this.orderService.updateStatus(orderId, updateOrderStatusDto)
    }

    @Post("delete-order/:orderId")
    async deleteMaterial(
        @Param('orderId', ParseIntPipe) orderId: number
    ) {
        return this.orderService.deleteOrder(orderId)
    }
}
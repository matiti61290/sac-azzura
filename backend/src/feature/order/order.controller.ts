import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { OrderService } from "./order.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdminGuard } from "../auth/guards/admin.guard";
import { UpdateOrderStatusDto } from "../../shared/dtos/order/updateOrderStatus.dto";

@Controller('orders')
export class OrderController {
constructor(
    private readonly orderService: OrderService
) {}
    @Get('')
    @UseGuards(JwtAuthGuard, AdminGuard)
    async getAllOrder() {
        return this.orderService.getAllOrder()
    }

    @Get('user/orders')
    @UseGuards(JwtAuthGuard)
    async getOrdersByUser(
        @Req() req
    ){
        const user = req.user
        return this.orderService.getOrdersByUser(user)
    }

    @Get('/:orderId')
    @UseGuards(JwtAuthGuard, AdminGuard)
    async getOrderById(
        @Param('orderId', ParseIntPipe) orderId: number
    ) {
        return this.orderService.getOrderById(orderId)
    }

    @Get("/user/orders/:orderId")
    @UseGuards(JwtAuthGuard)
    async GetOrderByIdByUser(
        @Req() req,
        @Param('orderId', ParseIntPipe) orderId: number
    ){
        const user = req.user
        return this.orderService.getOrderByIdByUser(user, orderId)
    }

    @Patch("/:orderId")
    @UseGuards(JwtAuthGuard, AdminGuard)
    async updateStatus(
        @Param('orderId', ParseIntPipe) orderId: number,
        @Body() updateOrderStatusDto: UpdateOrderStatusDto
    ){
        return this.orderService.updateStatus(orderId, updateOrderStatusDto)
    }

    @Delete("delete-order/:orderId")
    @UseGuards(JwtAuthGuard, AdminGuard)
    async deleteMaterial(
        @Param('orderId', ParseIntPipe) orderId: number
    ) {
        return this.orderService.deleteOrder(orderId)
    }
}
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { OrderEntity } from "src/entities/order.entity";
import { Repository } from "typeorm";

@Injectable()
export class OrderService {
    constructor(
        @InjectRepository(OrderEntity)
        private readonly orderRepository: Repository<OrderEntity>
    ) {}

    async getAllOrder(){
        const orders = await this.orderRepository.find()

        return orders
    }

    async getOrderById(orderId:number) {
        const order = this.orderRepository.findOne({where:{id: orderId}, relations:['user, stock']})

        return order
    }
}
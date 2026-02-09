import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { OrderEntity } from "src/entities/order.entity";
import { UserEntity } from "src/entities/user.entity";
import { UpdateOrderStatusDto } from "src/shared/dtos/order/updateOrderStatus.dto";
import { OrderStatus } from "src/shared/enum/order.enum";
import { Repository } from "typeorm";

@Injectable()
export class OrderService {
    constructor(
        @InjectRepository(OrderEntity)
        private readonly orderRepository: Repository<OrderEntity>,

        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>
    ) {}

    //Define authorized transitions
    private readonly allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
        [OrderStatus.PENDING]: [OrderStatus.PAID, OrderStatus.CANCELLED],
        [OrderStatus.PAID]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
        [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
        [OrderStatus.DELIVERED]: [],
        [OrderStatus.CANCELLED]: []
    }

    async getAllOrder(){
        const orders = await this.orderRepository.find()

        return orders
    }

    async getOrdersByUser(user){
        const orders = await this.userRepository.findOne({where: {id: user.id}, relations: ['order']})

        return orders
    }

    async getOrderById(orderId:number) {
        const order = this.orderRepository.findOne({where:{id: orderId}, relations:['user, stock']})

        return order
    }

    async getOrderByIdByUser(user: any, orderId: number){
        const order = await this.orderRepository.findOneBy({
            id: orderId,
            user: {id: user.id}
        })

        if(!order) {
            throw new NotFoundException("Commande introuvable pour cette utilisateur")
        }

        return order
    }

    async updateStatus(orderId:number , updateOrderStatusDto: UpdateOrderStatusDto) {
        const order = await this.orderRepository.findOne({ where: {id: orderId}})

        if(!order){
            throw new NotFoundException("Aucune commande n'a ete trouve")
        }

        const possibleNextStatuses = this.allowedTransitions[updateOrderStatusDto.status]

        if(!possibleNextStatuses.includes(updateOrderStatusDto.status)) {
            throw new BadRequestException(`transition impossible du statut ${order.status} vers le statut $${updateOrderStatusDto.status}`)
        }

        const updateData: any = {status: updateOrderStatusDto.status}

        if(updateOrderStatusDto.status === OrderStatus.SHIPPED){
            updateData.trackingNumber = updateData.trackingNumber
            updateData.shippedAt = new Date()
        }

        return this.orderRepository.update(orderId, updateData)
    }

    async deleteOrder(orderId: number){
        const order = await this.orderRepository.findOne({where: {id: orderId}})

        if(!order){
            throw new NotFoundException("Aucune commande trouvee")
        }

        return this.orderRepository.remove(order)
    }
}
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { OrderEntity } from "../../entities/order.entity";
import { UserEntity } from "../../entities/user.entity";
import { UpdateOrderStatusDto } from "../../shared/dtos/order/updateOrderStatus.dto";
import { OrderStatus } from "../../shared/enum/order.enum";

/**
 * Service for managing orders (CRUD operations and status transitions).
 */
@Injectable()
export class OrderService {
    /**
     * Injects the TypeORM repositories for OrderEntity and UserEntity operations.
     * @param orderRepository - The repository instance for all order CRUD operations.
     * @param userRepository - The repository instance for user entity lookups.
     */
    constructor(
        @InjectRepository(OrderEntity)
        private readonly orderRepository: Repository<OrderEntity>,

        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>
    ) {}

    /**
     * Defines allowed state transitions for order status to prevent invalid state changes.
     * Transitions follow a strict flow: PENDING → PAID/SHIPMENT/DELIVERED/CANCELLED.
     */
    private readonly allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
        [OrderStatus.PENDING]: [OrderStatus.PAID, OrderStatus.CANCELLED],
        [OrderStatus.PAID]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
        [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
        [OrderStatus.DELIVERED]: [],
        [OrderStatus.CANCELLED]: []
    }

    /**
     * Retrieves all orders from the database.
     * @returns An array of all OrderEntity instances.
     */
    async getAllOrder() {
        const orders = await this.orderRepository.find();
        return orders;
    }

    /**
     * Finds and returns all orders associated with a specific user.
     * @param user - The user object containing the ID to filter by.
     * @returns An array of OrderEntity instances belonging to the specified user.
     */
    async getOrdersByUser(user: any) {
        const orders = await this.orderRepository.find({ where: { user: { id: user.id } } });
        return orders;
    }

    /**
     * Retrieves a specific order by its unique ID with related entities loaded.
     * @param orderId - The unique identifier of the order to retrieve.
     * @returns The OrderEntity if found, with relations including items, stock, and products.
     */
    async getOrderById(orderId: number) {
        const order = this.orderRepository.findOne({ where: { id: orderId }, relations: ['user', 'items', 'items.stock', 'items.stock.product'] });

        return order;
    }

    /**
     * Retrieves an order by its ID and verifies ownership with the provided user.
     * @param user - The user object containing the ID for ownership verification.
     * @param orderId - The unique identifier of the order to retrieve.
     * @returns The OrderEntity if found and belongs to the specified user.
     * @throws NotFoundException - If no order exists with the given ID or belongs to another user.
     */
    async getOrderByIdByUser(user: any, orderId: number) {
        const order = await this.orderRepository.findOneBy({
            id: orderId,
            user: { id: user.id }
        });

        if (!order) {
            throw new NotFoundException("Aucune commande trouvée pour cet utilisateur");
        }

        return order;
    }

    /**
     * Updates the status of an order and validates allowed transitions.
     * Adds tracking number and shipped date when transitioning to SHIPPED status.
     * @param orderId - The unique identifier of the order to update.
     * @param updateOrderStatusDto - The DTO containing the new status and optional tracking information.
     * @returns An object containing the order with updated data.
     * @throws BadRequestException - If the transition is invalid for the current status.
     */
    async updateStatus(orderId: number, updateOrderStatusDto: UpdateOrderStatusDto) {
        const order = await this.orderRepository.findOne({ where: { id: orderId } });

        if (!order) {
            throw new NotFoundException("Aucune commande trouvée");
        }

        const possibleNextStatuses = this.allowedTransitions[order.status];

        if (!possibleNextStatuses || !possibleNextStatuses.includes(updateOrderStatusDto.status)) {
            throw new BadRequestException(`Transition impossible du statut ${order.status} vers le statut ${updateOrderStatusDto.status}`)
        }

        const updateData: any = { status: updateOrderStatusDto.status };

        if (updateOrderStatusDto.status === OrderStatus.SHIPPED) {
            updateData.trackingNumber = updateOrderStatusDto.trackingNumber;
            updateData.shippedAt = new Date();
        }

        await this.orderRepository.update(orderId, updateData);

        return { ...order, ...updateData };
    }

    /**
     * Permanently deletes an order from the database by its unique ID.
     * @param orderId - The unique identifier of the order to delete.
     * @throws NotFoundException - If no order exists with the given ID.
     */
    async deleteOrder(orderId: number) {
        const order = await this.orderRepository.findOne({ where: { id: orderId } });

        if (!order) {
            throw new NotFoundException("Aucune commande trouvée");
        }

        return this.orderRepository.remove(order);
    }
}
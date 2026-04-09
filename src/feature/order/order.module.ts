import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrderController } from "./order.controller";
import { OrderService } from "./order.service";
import { OrderEntity } from "../../entities/order.entity";
import { UserEntity } from "../../entities/user.entity";
import { StockEntity } from "../../entities/stock.entity";

@Module({
    imports: [TypeOrmModule.forFeature([OrderEntity, UserEntity, StockEntity])],
    controllers: [OrderController],
    providers: [OrderService]
})

export class OrderModule {}
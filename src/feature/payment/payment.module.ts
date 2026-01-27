import { Module } from "@nestjs/common";
import { PaymentController } from "./payment.controller";
import { PaymentService } from "./payment.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { StockEntity } from "src/entities/stock.entity";
import { ProductEntity } from "src/entities/product.entity";
import { OrderEntity } from "src/entities/order.entity";

@Module({
    imports:[TypeOrmModule.forFeature([StockEntity, ProductEntity, OrderEntity])],
    controllers: [PaymentController],
    providers: [PaymentService]
})

export class PaymentModule {}
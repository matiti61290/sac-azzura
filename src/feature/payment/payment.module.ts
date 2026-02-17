import { Module } from "@nestjs/common";
import { PaymentController } from "./payment.controller";
import { PaymentService } from "./payment.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { StockEntity } from "src/entities/stock.entity";
import { ProductEntity } from "src/entities/product.entity";
import { OrderEntity } from "src/entities/order.entity";
import { UserEntity } from "src/entities/user.entity";
import { PaymentSuccessMailService } from "./paymentMail/paymentSuccessMail.service";
import { paymentFailMailService } from "./paymentMail/paymentFailMail.service";
import { AddressEntity } from "src/entities/addresses.entity";

@Module({
    imports:[TypeOrmModule.forFeature([StockEntity, ProductEntity, OrderEntity, UserEntity, AddressEntity])],
    controllers: [PaymentController],
    providers: [PaymentService, PaymentSuccessMailService, paymentFailMailService]
})

export class PaymentModule {}
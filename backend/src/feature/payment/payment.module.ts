import { Module } from "@nestjs/common";
import { PaymentController } from "./payment.controller";
import { PaymentService } from "./payment.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PaymentSuccessMailService } from "./paymentMail/paymentSuccessMail.service";
import { paymentFailMailService } from "./paymentMail/paymentFailMail.service";
import { StockEntity } from "../../entities/stock.entity";
import { ProductEntity } from "../../entities/product.entity";
import { OrderEntity } from "../../entities/order.entity";
import { UserEntity } from "../../entities/user.entity";
import { AddressEntity } from "../../entities/addresses.entity";
import { PromotionEntity } from "../../entities/promotion.entity";

@Module({
    imports:[TypeOrmModule.forFeature([StockEntity, ProductEntity, OrderEntity, UserEntity, AddressEntity, PromotionEntity])],
    controllers: [PaymentController],
    providers: [PaymentService, PaymentSuccessMailService, paymentFailMailService]
})

export class PaymentModule {}
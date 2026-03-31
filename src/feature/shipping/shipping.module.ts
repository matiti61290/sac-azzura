import { Module } from "@nestjs/common";
import { ShippingController } from "./shipping.controller";
import { MondialRelayService } from "./service/mondial-relai.service";
import { ColissimoService } from "./service/colissimo.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrderEntity } from "src/entities/order.entity";

@Module({
    imports:[TypeOrmModule.forFeature([OrderEntity])],
    controllers: [ShippingController],
  providers: [MondialRelayService, ColissimoService]
})

export class ShippingModule {}
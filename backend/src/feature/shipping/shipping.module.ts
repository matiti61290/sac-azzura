import { Module } from "@nestjs/common";
import { ShippingController } from "./shipping.controller";
import { MondialRelayService } from "./service/mondial-relai.service";
import { ColissimoService } from "./service/colissimo.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AwsS3Service } from "../aws-s3/aws-s3.service";
import { OrderEntity } from "../../entities/order.entity";

@Module({
    imports:[TypeOrmModule.forFeature([OrderEntity])],
    controllers: [ShippingController],
  providers: [MondialRelayService, ColissimoService, AwsS3Service]
})

export class ShippingModule {}
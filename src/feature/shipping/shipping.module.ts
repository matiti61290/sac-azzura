import { Module } from "@nestjs/common";
import { ShippingController } from "./shipping.controller";
import { MondialRelayService } from "./service/mondial-relai.service";

@Module({
    imports:[],
    controllers: [ShippingController],
    providers: [MondialRelayService]
})

export class ShippingModule {}
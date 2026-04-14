import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AddressController } from "./address.controller";
import { AddressService } from "./address.service";
import { AddressEntity } from "../../entities/addresses.entity";

@Module({
    imports: [TypeOrmModule.forFeature([AddressEntity])],
    controllers: [AddressController],
    providers: [AddressService]
})

export class AddressModule {}
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AddressEntity } from "src/entities/addresses.entity";
import { AddressController } from "./address.controller";
import { AddressService } from "./address.service";

@Module({
    imports: [TypeOrmModule.forFeature([AddressEntity])],
    controllers: [AddressController],
    providers: [AddressService]
})

export class AddressModule {}
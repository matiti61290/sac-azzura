import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MaterialController } from "./material.controller";
import { MaterialService } from "./material.service";
import { MaterialEntity } from "../../entities/material.entity";

@Module({
    imports: [TypeOrmModule.forFeature([MaterialEntity])],
    controllers: [MaterialController],
    providers: [MaterialService]
})

export class MaterialModule {}
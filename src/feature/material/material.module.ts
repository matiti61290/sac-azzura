import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MaterialEntity } from "src/entities/material.entity";
import { MaterialController } from "./material.controller";
import { MaterialService } from "./material.service";

@Module({
    imports: [TypeOrmModule.forFeature([MaterialEntity])],
    controllers: [MaterialController],
    providers: [MaterialService]
})

export class MaterialModule {}
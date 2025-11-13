import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ColorController } from "./color.controller";
import { ColorService } from "./color.service";
import { ColorEntity } from "src/entities/color.entity";

@Module({
    imports: [TypeOrmModule.forFeature([ColorEntity])],
    controllers: [ColorController],
    providers: [ColorService]
})

export class ColorModule {}
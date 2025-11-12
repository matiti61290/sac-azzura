import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { StockEntity } from "src/entities/stock.entity";
import { ColorController } from "./color.controller";
import { ColorService } from "./color.service";

@Module({
    imports: [TypeOrmModule.forFeature([StockEntity])],
    controllers: [ColorController],
    providers: [ColorService]
})

export class ColorModule {}
import { Controller, Get, Param, ParseIntPipe, Post, UseGuards } from "@nestjs/common";
import { StockService } from "./stock.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdminGuard } from "../auth/guards/admin.guard";

@Controller('stocks')
export class StockController {
    constructor(
        private readonly stockService: StockService
    ){}

    @Get('')
    @UseGuards(JwtAuthGuard, AdminGuard)
    async getAllStock(){
        return this.stockService.getAllStock()
    }

    @Post('delete-stock/:stockId')
    @UseGuards(JwtAuthGuard, AdminGuard)
    async deleteStock(
        @Param('stockId', ParseIntPipe) stockId: number
    ){
        const stock = await this.stockService.getStockById(stockId)
        const stockSku = stock.sku
        this.stockService.deleteStockByProductId(stockSku)
        return "Stock supprime"
    }
}
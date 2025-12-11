import { Controller, Get, Param, ParseIntPipe, Post } from "@nestjs/common";
import { StockService } from "./stock.service";

@Controller('stocks')
export class StockController {
    constructor(
        private readonly stockService: StockService
    ){}

    @Get('')
    async getAllStock(){
        return this.stockService.getAllStock()
    }

    @Post('delete-stock/:stockId')
    async deleteStock(
        @Param('stockId', ParseIntPipe) stockId: number
    ){
        const stock = await this.stockService.getStockById(stockId)
        const stockSku = stock.sku
        this.stockService.deleteStockByProductId(stockSku)
        return "Stock supprime"
    }
}
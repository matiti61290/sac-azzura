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
        @Param('stockSku', ParseIntPipe) stockId: number
    ){
        this.stockService.deleteStockByProductId(stockId)
        return "Stock supprime"
    }
}
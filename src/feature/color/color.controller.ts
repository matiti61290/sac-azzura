import { Controller, Get, Param, ParseIntPipe } from "@nestjs/common";
import { ColorService } from "./color.service";

@Controller('color')
export class ColorController {
    constructor(
        private readonly colorService : ColorService
    ) {}

    @Get('')
    async getAllColors() {
        return this.colorService.getAllColors()
    }

    @Get('/:colorId')
    async findColorById(
        @Param('colorId', ParseIntPipe) colorId: number
    ) {
        return this.colorService.getColorById(colorId)
    }
}
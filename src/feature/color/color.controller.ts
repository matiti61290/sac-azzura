import { Controller, Get, Post, Param, Body, ParseIntPipe } from "@nestjs/common";
import { ColorService } from "./color.service";
import { AddColorDto } from "src/shared/dtos/color/addColor.dto";
import { UpdateColorDto } from "src/shared/dtos/color/updateColor.dto";

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

    @Post('add-color')
    async addColor (
        @Body() addColorDto: AddColorDto
    ) {
        return this.colorService.addColor(addColorDto)
    }

    @Post('update-color/:colorId')
    async updateColor(
        @Param('colorId', ParseIntPipe) colorId: number,
        @Body() updateColorDto: UpdateColorDto
    ) {
        return this.colorService.updateColor(colorId, updateColorDto)
    }

    @Post('delete-color/:colorId')
    async MissingDeleteDateColumnError(
        @Param('colorId', ParseIntPipe) colorId: number
    ) {
        this.colorService.deleteColor(colorId)
        return "Couleur supprimee"
    }
}
import { Controller, Get, Post, Param, Body, ParseIntPipe, UseGuards } from "@nestjs/common";
import { ColorService } from "./color.service";
import { AddColorDto } from "src/shared/dtos/color/addColor.dto";
import { UpdateColorDto } from "src/shared/dtos/color/updateColor.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdminGuard } from "../auth/guards/admin.guard";

@Controller('colors')
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
    @UseGuards(JwtAuthGuard, AdminGuard)
    async addColor (
        @Body() addColorDto: AddColorDto
    ) {
        return this.colorService.addColor(addColorDto)
    }

    @Post('update-color/:colorId')
    @UseGuards(JwtAuthGuard, AdminGuard)
    async updateColor(
        @Param('colorId', ParseIntPipe) colorId: number,
        @Body() updateColorDto: UpdateColorDto
    ) {
        return this.colorService.updateColor(colorId, updateColorDto)
    }

    @Post('delete-color/:colorId')
    @UseGuards(JwtAuthGuard, AdminGuard)
    async MissingDeleteDateColumnError(
        @Param('colorId', ParseIntPipe) colorId: number
    ) {
        this.colorService.deleteColor(colorId)
        return "Couleur supprimee"
    }
}
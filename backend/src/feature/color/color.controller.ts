import { Controller, Get, Post, Param, Body, ParseIntPipe, UseGuards, Delete, Patch } from "@nestjs/common";
import { ColorService } from "./color.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdminGuard } from "../auth/guards/admin.guard";
import { AddColorDto } from "../../shared/dtos/color/addColor.dto";
import { UpdateColorDto } from "../../shared/dtos/color/updateColor.dto";

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

    @Patch('update-color/:colorId')
    @UseGuards(JwtAuthGuard, AdminGuard)
    async updateColor(
        @Param('colorId', ParseIntPipe) colorId: number,
        @Body() updateColorDto: UpdateColorDto
    ) {
        return this.colorService.updateColor(colorId, updateColorDto)
    }

    @Delete('delete-color/:colorId')
    @UseGuards(JwtAuthGuard, AdminGuard)
    async MissingDeleteDateColumnError(
        @Param('colorId', ParseIntPipe) colorId: number
    ) {
        this.colorService.deleteColor(colorId)
        return "Couleur supprimee"
    }
}
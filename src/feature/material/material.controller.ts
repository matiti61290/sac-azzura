import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from "@nestjs/common";
import { MaterialService } from "./material.service";
import { AddMaterialDto } from "src/shared/dtos/material/addMaterial.dto";
import { UpdateMaterialDto } from "src/shared/dtos/material/updateMaterial.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdminGuard } from "../auth/guards/admin.guard";

@Controller('materials')
export class MaterialController {
    constructor(
        private readonly materialService: MaterialService
    ) {}

    @Get('')
    async getAllMaterial() {
        return this.materialService.getAllMaterials()
    }

    @Get('/:materialId')
    async getMaterialById(
        @Param('materialId', ParseIntPipe) materialId: number
    ) {
        return this.materialService.getMaterialById(materialId)
    }

    @Post('add-material')
    @UseGuards(JwtAuthGuard, AdminGuard)
    async addMaterial(
        @Body() addMaterialDto: AddMaterialDto
    ) {
        return this.materialService.createMaterial(addMaterialDto)
    }

    @Post('update-material/:materialId')
    @UseGuards(JwtAuthGuard, AdminGuard)
    async updateMaterial(
        @Param('materialId', ParseIntPipe) materialId: number,
        @Body() updateMaterialDto: UpdateMaterialDto
    ) {
        return this.materialService.updateMaterial(materialId, updateMaterialDto)
    }

    @Post('delete-material/:materialId')
    @UseGuards(JwtAuthGuard, AdminGuard)
    async deleteMaterial(
        @Param('materialId', ParseIntPipe) materialId: number
    ) {
        return this.materialService.deleteMaterial(materialId)
    }
}
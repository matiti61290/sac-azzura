import { Body, Controller, Get, Param, ParseIntPipe, Post } from "@nestjs/common";
import { MaterialService } from "./material.service";
import { AddMaterialDto } from "src/shared/dtos/material/addMaterial.dto";
import { UpdateMaterialDto } from "src/shared/dtos/material/updateMaterial.dto";

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
    async addMaterial(
        @Body() addMaterialDto: AddMaterialDto
    ) {
        return this.materialService.createMaterial(addMaterialDto)
    }

    @Post('update-material/:materialId')
    async updateMaterial(
        @Param('materialId', ParseIntPipe) materialId: number,
        @Body() updateMaterialDto: UpdateMaterialDto
    ) {
        return this.materialService.updateMaterial(materialId, updateMaterialDto)
    }

    @Post('delete-material/:materialId')
    async deleteMaterial(
        @Param('materialId', ParseIntPipe) materialId: number
    ) {
        return this.materialService.deleteMaterial(materialId)
    }
}
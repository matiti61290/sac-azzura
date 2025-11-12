import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MaterialEntity } from "src/entities/material.entity";
import { AddMaterialDto } from "src/shared/dtos/material/addMaterial.dto";
import { UpdateMaterialDto } from "src/shared/dtos/material/updateMaterial.dto";
import { Repository } from "typeorm";

@Injectable()
export class MaterialService {
    constructor(
        @InjectRepository(MaterialEntity)
        private readonly materialRepository: Repository<MaterialEntity>
    ) {}

    async getAllMaterials(){
        const materials = await this.materialRepository.find()
        
        if(!materials){
            throw new NotFoundException
        }

        return materials
    }

    async getMaterialById(materialId: number){
        const material = await this.materialRepository.findOne({ where: {id: materialId}})

        if(!material) {
            throw new NotFoundException
        }

        return material
    }

    async createMaterial(addMaterialDto: AddMaterialDto) {
        const newMaterial = this.materialRepository.create({
            ...addMaterialDto
        })

        await this.materialRepository.save(newMaterial)
        
        return newMaterial
    }

    async updateMaterial(materialId: number, updateMaterialDto: UpdateMaterialDto) {
        const material = await this.materialRepository.findOne({ where: {id: materialId}})

        if(!material) {
            throw new NotFoundException
        }

        Object.assign(material, updateMaterialDto)

        return this.materialRepository.save(material)
    }

    async deleteMaterial(materialId: number) {
        const material = await this.materialRepository.findOne({ where: {id: materialId}})

        if(!material) {
            throw new NotFoundException
        }

        return this.materialRepository.remove(material)
    }
}
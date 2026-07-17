import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { MaterialEntity } from "../../entities/material.entity";
import { AddMaterialDto } from "../../shared/dtos/material/addMaterial.dto";
import { UpdateMaterialDto } from "../../shared/dtos/material/updateMaterial.dto";

/**
 * Service for managing materials (CRUD operations).
 */
@Injectable()
export class MaterialService {
    /**
     * Injects the TypeORM repository for MaterialEntity operations.
     * @param materialRepository The repository instance for all material CRUD operations.
     */
    constructor(
        @InjectRepository(MaterialEntity)
        private readonly materialRepository: Repository<MaterialEntity>
    ) {}

    /**
     * Retrieves all available materials from the database.
     * @returns An array of MaterialEntity instances, or throws NotFoundException if empty.
     */
    async getAllMaterials() {
        const materials = await this.materialRepository.find();
        
        if (!materials.length) {
            throw new NotFoundException("Matériau non trouvé");
        }

        return materials;
    }

    /**
     * Finds a specific material by its unique ID.
     * @param materialId - The unique identifier of the material to retrieve.
     * @returns The MaterialEntity if found.
     * @throws NotFoundException - If no material exists with the given ID.
     */
    async getMaterialById(materialId: number) {
        const material = await this.materialRepository.findOne({ where: { id: materialId } });

        if (!material) {
            throw new NotFoundException("Matériau non trouvé");
        }

        return material;
    }

    /**
     * Creates and saves a new material to the database.
     * @param addMaterialDto - The DTO containing material data (name, quantity, etc.).
     * @returns The newly created and saved MaterialEntity.
     */
    async createMaterial(addMaterialDto: AddMaterialDto) {
        const newMaterial = this.materialRepository.create({ ...addMaterialDto });
        
        await this.materialRepository.save(newMaterial);
        
        return newMaterial;
    }

    /**
     * Updates an existing material with the provided data.
     * @param materialId - The unique identifier of the material to update.
     * @param updateMaterialDto - The DTO containing updated material fields.
     * @returns The updated and saved MaterialEntity.
     * @throws NotFoundException - If no material exists with the given ID.
     */
    async updateMaterial(materialId: number, updateMaterialDto: UpdateMaterialDto) {
        const material = await this.materialRepository.findOne({ where: { id: materialId } });

        if (!material) {
            throw new NotFoundException("Matériau non trouvé");
        }

        Object.assign(material, updateMaterialDto);

        return this.materialRepository.save(material);
    }

    /**
     * Deletes a material by its unique ID.
     * @param materialId - The unique identifier of the material to delete.
     * @throws NotFoundException - If no material exists with the given ID.
     */
    async deleteMaterial(materialId: number) {
        const material = await this.materialRepository.findOne({ where: { id: materialId } });

        if (!material) {
            throw new NotFoundException("Matériau non trouvé");
        }

        return this.materialRepository.remove(material);
    }
}
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ColorEntity } from "../../entities/color.entity";
import { AddColorDto } from "../../shared/dtos/color/addColor.dto";
import { UpdateColorDto } from "../../shared/dtos/color/updateColor.dto";

/**
 * Service for managing product colors (CRUD operations).
 */
@Injectable()
export class ColorService {
    constructor(
        @InjectRepository(ColorEntity)
        private readonly colorRepository: Repository<ColorEntity>
    ) {}

    /**
     * Retrieves all available product colors from the database.
     * @returns An array of ColorEntity instances representing all color options.
     */
    async getAllColors(){
        const colors = await this.colorRepository.find()

        if (!colors) {
            throw new NotFoundException
        }

        return colors
    }

    /**
     * Finds and returns a specific color by its unique ID.
     * @param colorId - The unique identifier of the color to retrieve.
     * @returns The ColorEntity with all relations populated if found.
     * @throws NotFoundException - If no color exists with the given ID.
     */
    async getColorById(colorId: number){
        const color = await this.colorRepository.findOne({ where: {id: colorId} })

        if(!color) {
            throw new NotFoundException
        }

        return color
    }

    /**
     * Creates a new product color in the database.
     * @param addColorDto - DTO containing the color name, hex code, and SKU code.
     * @returns The newly created ColorEntity that was saved to the database.
     */
    async addColor(addColorDto: AddColorDto) {
        const newColor = this.colorRepository.create({
            ...addColorDto
        })

        await this.colorRepository.save(newColor)

        return newColor
    }

    /**
     * Updates an existing product color with new data.
     * @param colorId - The unique identifier of the color to update.
     * @param updateColorDto - DTO containing the updated color fields (name, hexCode, skuCode).
     * @returns The updated and saved ColorEntity.
     * @throws NotFoundException - If no color exists with the given ID.
     */
    async updateColor(colorId: number, updateColorDto: UpdateColorDto) {
        const color = await this.colorRepository.findOne({ where: {id: colorId}})

        if (!color) {
            throw new NotFoundException
        }

        Object.assign(color, updateColorDto)
        
        return this.colorRepository.save(color)
    }

    /**
     * Permanently deletes a product color from the database.
     * @param colorId - The unique identifier of the color to delete.
     * @throws NotFoundException - If no color exists with the given ID.
     */
    async deleteColor(colorId: number) {
        const color = await this.colorRepository.findOne({ where: {id: colorId}})

        if(!color){
            throw new NotFoundException
        }

        return this.colorRepository.remove(color)
    }
}
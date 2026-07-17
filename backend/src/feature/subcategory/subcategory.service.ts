import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CategoryEntity } from "../../entities/categories.entity";
import { SubcategoryEntity } from "../../entities/subcategory.entity";
import { AddSubcategoryDto } from "../../shared/dtos/subcategory/addSubcategory.dto";
import { UpdateSubcategoryDto } from "../../shared/dtos/subcategory/updateSubcategory.dto";

/**
 * Service for managing subcategories (CRUD operations with category relations).
 */
@Injectable()
export class SubcategoryService {
    /**
     * Injects repositories for subcategory and category entity operations.
     * @param subcategoryRepository - Repository for SubcategoryEntity CRUD operations.
     * @param categoryRepository - Repository for CategoryEntity lookups during subcategory creation/update.
     */
    constructor(
        @InjectRepository(SubcategoryEntity)
        private readonly subcategoryRepository: Repository<SubcategoryEntity>,

        @InjectRepository(CategoryEntity)
        private readonly categoryRepository: Repository<CategoryEntity>
    ) {}

    /**
     * Retrieves all subcategories with their associated category relations.
     * @returns An array of SubcategoryEntity instances with populated category details.
     * @throws NotFoundException - If no subcategories are found.
     */
    async getAllSubcategories() {
        const subcategories = await this.subcategoryRepository.find({
            relations: ['category']
        })

        if(!subcategories) {
            throw new NotFoundException
        }

        return subcategories
    }

    /**
     * Finds and returns a specific subcategory by its unique ID.
     * @param subcategoryId - The unique identifier of the subcategory to retrieve.
     * @returns The SubcategoryEntity with populated category relation if found.
     * @throws NotFoundException - If no subcategory exists with the given ID.
     */
    async FindSubcategoryById(subcategoryId: number) {
        const subcategory = await this.subcategoryRepository.findOne({ where: {id: subcategoryId}, relations: ['category']})

        if(!subcategory){
            throw new NotFoundException
        }

        return subcategory
    }

    /**
     * Creates a new subcategory under the specified category.
     * Validates that the parent category exists before creating the subcategory.
     * @param addSubcategoryDto - DTO containing subcategory name, description, and category ID.
     * @returns The newly created SubcategoryEntity with populated relations.
     * @throws NotFoundException - If the parent category is not found.
     */
    async createSubcategory(addSubcategoryDto: AddSubcategoryDto){
        const categoryId = addSubcategoryDto.categoryId
        const category = await this.categoryRepository.findOne({ where:{ id: categoryId}})

        console.log(category)

        if(!category){
            throw new NotFoundException
        }

        const newSubcategory = this.subcategoryRepository.create({
            ...addSubcategoryDto,
            category: category
        })

        await this.subcategoryRepository.save(newSubcategory)

        return newSubcategory
    }

    /**
     * Updates an existing subcategory with new data.
     * Handles optional category reassignment and validates the new category exists if provided.
     * @param subcategoryId - The unique identifier of the subcategory to update.
     * @param updateSubcategoryDto - DTO containing updated subcategory fields (name, description).
     * @returns The updated SubcategoryEntity with populated relations.
     * @throws NotFoundException - If the subcategory doesn't exist or new category is invalid.
     */
    async updateSubcategory(subcategoryId: number, updateSubcategoryDto: UpdateSubcategoryDto){
        const subcategory = await this.subcategoryRepository.findOne({ where: {id: subcategoryId}, relations: ['category']})

        if(!subcategory){
            throw new NotFoundException
        }

        if (updateSubcategoryDto.categoryId) {
            const newCategory = await this.categoryRepository.findOne({ where: { id: updateSubcategoryDto.categoryId}})

            if(!newCategory) {
                throw new NotFoundException
            }

            subcategory.category = newCategory
        }

        Object.assign(subcategory, updateSubcategoryDto)

        return this.subcategoryRepository.save(subcategory)
    }

    /**
     * Permanently deletes a subcategory from the database.
     * @param subcategoryId - The unique identifier of the subcategory to delete.
     * @returns Confirmation that the subcategory was deleted.
     * @throws NotFoundException - If no subcategory exists with the given ID.
     */
    async deleteSubcategory(subcategoryId: number){
        const subcategory = await this.subcategoryRepository.findOne({where: {id:subcategoryId}})

        if(!subcategory){
            throw new NotFoundException
        }

        return this.subcategoryRepository.remove(subcategory)
    }
}
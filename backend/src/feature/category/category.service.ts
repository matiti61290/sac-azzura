
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CategoryEntity } from "../../entities/categories.entity";
import { AddCategoryDto } from "../../shared/dtos/category/addCategory.dto";
import { UpdateCategoryDto } from "../../shared/dtos/category/updateCategory.dto";

/**
 * Service for managing categories (CRUD operations).
 */

@Injectable()
export class CategoryService {
    /**
     * Injects the TypeORM repository for CategoryEntity operations.
     * @param categoryRepository The repository instance for all category CRUD operations.
     */
    constructor(
        @InjectRepository(CategoryEntity)
        private readonly categoryRepository: Repository<CategoryEntity>
    ) {}

    /**
     * Retrieves all categories with their subcategories loaded.
     * @returns An array of CategoryEntity instances, each containing its nested subcategories.
     */
    async getAllCategory() {
        const categories = await this.categoryRepository.find({ relations:['subcategories']})

        return categories
    }

    /**
     * Finds a category by its unique ID.
     * @param categoryId - The unique identifier of the category to search for.
     * @returns The CategoryEntity if found.
     * @throws NotFoundException - If no category exists with the given ID.
     */
    async findCategoryById(categoryId: number) {
        const category = await this.categoryRepository.findOne({ where:{ id: categoryId}})

        if(!category) {
            throw new NotFoundException
        }

        return category
    }

    /**
     * Creates and saves a new category to the database.
     * @param addCategoryDto - The DTO containing category data (name, slug, etc.).
     * @returns The newly created and saved CategoryEntity.
     */
    async addCategory(addCategoryDto: AddCategoryDto) {
        const newCategory = await this.categoryRepository.create({
            ...addCategoryDto
        })

        await this.categoryRepository.save(newCategory)

        return newCategory
    }

    /**
     * Updates an existing category with the provided data.
     * @param categoryId - The unique identifier of the category to update.
     * @param updateCategoryDto - The DTO containing updated category fields.
     * @returns The updated and saved CategoryEntity.
     * @throws NotFoundException - If no category exists with the given ID.
     */
    async updateCategory(categoryId: number, updateCategoryDto: UpdateCategoryDto) {
        const category = await this.categoryRepository.findOne({ where:{ id:categoryId}})

        if(!category){
            throw new NotFoundException
        }

        Object.assign(category, updateCategoryDto)

        return this.categoryRepository.save(category)
    }

    /**
     * Deletes a category by its unique ID.
     * @param categoryId - The unique identifier of the category to delete.
     * @throws NotFoundException - If no category exists with the given ID.
     */
    async deleteCategory(categoryId: number) {
        const category = await this.categoryRepository.findOne({ where: {id: categoryId}})

        if(!category){
            throw new NotFoundException
        }

        return this.categoryRepository.remove(category)
    }
}
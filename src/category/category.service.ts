import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CategoryEntity } from "src/entities/categories.entity";
import { AddCategoryDto } from "src/shared/dtos/category/addCategory.dto";
import { UpdateCategoryDto } from "src/shared/dtos/category/updateCategory.dto";
import { Repository } from "typeorm";

@Injectable()
export class CategoryService{
    constructor(
        @InjectRepository(CategoryEntity)
        private readonly categoryRepository: Repository<CategoryEntity>
    ) {}

    async getAllCategory(){
        const categories = await this.categoryRepository.find()

        return categories
    }

    async findCategoryById(categoryId: number) {
        const category =  this.categoryRepository.findOne({ where:{ id: categoryId}})

        if(!category) {
            throw new NotFoundException
        }

        return category
    }

    async addCategory(addCategoryDto: AddCategoryDto){
        const newCategory = this.categoryRepository.create({
            ...addCategoryDto
        })

        await this.categoryRepository.save(newCategory)

        return newCategory
    }

    async updateCategory(categoryId: number, updateCategoryDto: UpdateCategoryDto) {
        const category = await this.categoryRepository.findOne({ where:{ id:categoryId}})

        if(!category){
            throw new NotFoundException
        }

        Object.assign(category, updateCategoryDto)

        return this.categoryRepository.save(category)
    }

    async deleteCategory(categoryId: number) {
        const category = await this.categoryRepository.findOne({ where: {id: categoryId}})

        if(!category){
            throw new NotFoundException
        }

        return this.categoryRepository.remove(category)
    }
}
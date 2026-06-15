import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CategoryEntity } from "../../entities/categories.entity";
import { AddCategoryDto } from "../../shared/dtos/category/addCategory.dto";
import { UpdateCategoryDto } from "../../shared/dtos/category/updateCategory.dto";

@Injectable()
export class CategoryService{
    constructor(
        @InjectRepository(CategoryEntity)
        private readonly categoryRepository: Repository<CategoryEntity>
    ) {}

    async getAllCategory(){
        const categories = await this.categoryRepository.find({ relations:['subcategories']})

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
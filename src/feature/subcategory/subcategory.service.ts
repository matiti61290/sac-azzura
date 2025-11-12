import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CategoryEntity } from "src/entities/categories.entity";
import { SubcategoryEntity } from "src/entities/subcategory.entity";
import { AddSubcategoryDto } from "src/shared/dtos/subcategory/addSubcategory.dto";
import { UpdateSubcategoryDto } from "src/shared/dtos/subcategory/updateSubcategory.dto";
import { Repository } from "typeorm";

@Injectable()
export class SubcategoryService {
    constructor(
        @InjectRepository(SubcategoryEntity)
        private readonly subcategoryRepository: Repository<SubcategoryEntity>,

        @InjectRepository(CategoryEntity)
        private readonly categoryRepository: Repository<CategoryEntity>
    ) {}

    async getAllSubcategories(){
        const subcategories = await this.subcategoryRepository.find()

        if(!subcategories) {
            throw new NotFoundException
        }

        return subcategories
    }

    async FindSubcategoryById(subcategoryId: number) {
        const subcategory = await this.subcategoryRepository.findOne({ where: {id: subcategoryId}, relations: ['category']})

        if(!subcategory){
            throw new NotFoundException
        }

        return subcategory
    }

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

    async deleteSubcategory(subcategoryId: number){
        const subcategory = await this.subcategoryRepository.findOne({where: {id:subcategoryId}})

        if(!subcategory){
            throw new NotFoundException
        }

        return this.subcategoryRepository.remove(subcategory)
    }
}
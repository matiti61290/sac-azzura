import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SubcategoryEntity } from "src/entities/subcategory.entity";
import { AddSubcategoryDto } from "src/shared/dtos/subcategory/addSubcategory.dto";
import { UpdateSubcategoryDto } from "src/shared/dtos/subcategory/updateSubcategory.dto";
import { Repository } from "typeorm";

@Injectable()
export class SubcategoryService {
    constructor(
        @InjectRepository(SubcategoryEntity)
        private readonly subcategoryRepository: Repository<SubcategoryEntity>
    ) {}

    async getAllSubcategories(){
        const subcategories = this.subcategoryRepository.find()

        if(!subcategories) {
            throw new NotFoundException
        }

        return subcategories
    }

    async FindSubcategoryById(subcategoryId: number) {
        const subcategory = this.subcategoryRepository.findOne({ where: {id: subcategoryId}})

        if(!subcategory){
            throw new NotFoundException
        }

        return subcategory
    }

    async createSubcategory(addSubcategoryDto: AddSubcategoryDto){
        const newSubcategory = this.subcategoryRepository.create({
            ...addSubcategoryDto
        })

        await this.subcategoryRepository.save(newSubcategory)

        return newSubcategory
    }

    async updateSubcategory(subcategoryId: number, updateSubcategoryDto: UpdateSubcategoryDto){
        const subcategory = await this.subcategoryRepository.findOne({ where: {id: subcategoryId}})

        if(!subcategory){
            throw new NotFoundException
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
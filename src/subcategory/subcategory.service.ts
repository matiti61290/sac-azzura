import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SubcategoryEntity } from "src/entities/subcategory.entity";
import { Repository } from "typeorm";

@Injectable()
export class SubcategoryService {
    constructor(
        @InjectRepository(SubcategoryService)
        private readonly subcategoryRepository: Repository<SubcategoryEntity>
    ) {}

    async getAllSubcategories(){
        const subcategories = this.subcategoryRepository.find()

        if(!subcategories) {
            throw new NotFoundException
        }

        return subcategories
    }
}
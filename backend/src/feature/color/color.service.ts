import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ColorEntity } from "../../entities/color.entity";
import { AddColorDto } from "../../shared/dtos/color/addColor.dto";
import { UpdateColorDto } from "../../shared/dtos/color/updateColor.dto";

@Injectable()
export class ColorService {
    constructor(
        @InjectRepository(ColorEntity)
        private readonly colorRepository: Repository<ColorEntity>
    ) {}

    async getAllColors(){
        const colors = await this.colorRepository.find()

        if (!colors) {
            throw new NotFoundException
        }

        return colors
    }

    async getColorById(colorId: number){
        const color = await this.colorRepository.findOne({ where: {id: colorId} })

        if(!color) {
            throw new NotFoundException
        }

        return color
    }

    async addColor(addColorDto: AddColorDto) {
        const newColor = this.colorRepository.create({
            ...addColorDto
        })

        await this.colorRepository.save(newColor)

        return newColor
    }

    async updateColor(colorId: number, updateColorDto: UpdateColorDto) {
        const color = await this.colorRepository.findOne({ where: {id: colorId}})

        if (!color) {
            throw new NotFoundException
        }

        Object.assign(color, updateColorDto)
        
        return this.colorRepository.save(color)
    }

    async deleteColor(colorId: number) {
        const color = await this.colorRepository.findOne({ where: {id: colorId}})

        if(!color){
            throw new NotFoundException
        }

        return this.colorRepository.remove(color)
    }
}
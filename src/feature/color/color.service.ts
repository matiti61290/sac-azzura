import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ColorEntity } from "src/entities/color.entity";
import { Repository } from "typeorm";

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
}
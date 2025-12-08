import { PartialType } from "@nestjs/mapped-types";
import { AddProductDto} from './addProduct.dto'
import { IsArray, IsNotEmpty } from "class-validator";

export class UpdateProductDto extends PartialType(AddProductDto) {
        @IsNotEmpty()
        @IsArray()
        files: Express.Multer.File[]
}
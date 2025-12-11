import { PartialType } from "@nestjs/mapped-types";
import { AddProductDto} from './addProduct.dto'
import { IsArray, IsInt, IsNotEmpty, IsString } from "class-validator";

export class UpdateProductDto extends PartialType(AddProductDto) {
        @IsNotEmpty()
        @IsArray()
        files: Express.Multer.File[]

        @IsString()
        stock_sku: string
}
import { PartialType } from "@nestjs/mapped-types";
import { AddProductDto } from './addProduct.dto'
import { IsArray, IsInt, IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";

export class UpdateProductDto extends PartialType(AddProductDto) {
    @IsOptional()
    @IsArray()
    files?: Express.Multer.File[]

    @IsOptional()
    @IsString()
    stock_sku?: string

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    quantity?: number
}
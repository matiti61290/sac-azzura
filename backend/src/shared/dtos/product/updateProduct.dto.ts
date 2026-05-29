import { PartialType } from "@nestjs/mapped-types";
import { AddProductDto } from './addProduct.dto'
import { IsArray, IsInt, IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";

export class UpdateProductDto extends PartialType(AddProductDto) {
    // Rend les fichiers optionnels (on ne met pas forcément à jour les photos à chaque fois)
    @IsOptional()
    @IsArray()
    files?: Express.Multer.File[]

    // Optionnel : seulement si on veut mettre à jour un stock précis
    @IsOptional()
    @IsString()
    stock_sku?: string

    // AJOUT ICI : On remet explicitement quantity
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    quantity?: number
}
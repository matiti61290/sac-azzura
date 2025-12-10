import { IsInt, IsNotEmpty, IsString } from "class-validator";

export class AddSubcategoryDto {
    @IsNotEmpty()
    @IsString()
    name: string

    @IsNotEmpty()
    @IsInt()
    categoryId: number

    @IsNotEmpty()
    @IsString()
    sku_code: string
}
import { IsNotEmpty, IsString } from "class-validator";

export class AddCategoryDto {
    @IsNotEmpty()
    @IsString()
    name: string

    @IsNotEmpty()
    @IsString()
    sku_code: string
}
import { IsInt, IsNotEmpty, IsString } from "class-validator";

export class AddSubcategoryDto {
    @IsNotEmpty()
    @IsString()
    name: string

    @IsNotEmpty()
    @IsInt()
    categoryId: number
}
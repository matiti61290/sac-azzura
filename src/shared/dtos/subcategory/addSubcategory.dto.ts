import { IsNotEmpty, IsString } from "class-validator";

export class AddSubcategoryDto {
    @IsNotEmpty()
    @IsString()
    name: string
}
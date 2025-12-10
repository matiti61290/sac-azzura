import { IsNotEmpty, IsString } from "class-validator";

export class AddColorDto {
    @IsNotEmpty()
    @IsString()
    name: string

    @IsNotEmpty()
    @IsString()
    sku_code: string
}
import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsPositive, IsString, IsNumber, IsOptional } from "class-validator";

export class AddProductDto {
    @IsNotEmpty()
    @IsString()
    name!: string;

    @IsNotEmpty()
    @IsString()
    description!: string;

    @IsNotEmpty()
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    @Type(() => Number)
    price!: number;

    @IsNotEmpty()
    @IsInt()
    @Type(() => Number)
    subcategoryId!: number;

    @IsNotEmpty()
    @IsString()
    sku_code!: string;

    // LA CLÉ EST ICI : On force NestJS à le voir uniquement comme une string !
    @IsNotEmpty()
    @IsString()
    variations!: string; 
}
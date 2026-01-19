import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsPositive, IsString, IsArray, Matches, isInt, IsNumber } from "class-validator";

export class AddProductDto{
    @IsNotEmpty()
    @IsString()
    name: string

    @IsNotEmpty()
    @IsString()
    description: string

    @IsNotEmpty()
    @IsNumber({maxDecimalPlaces: 2})
    @IsPositive()
    @Type(()=> Number)
    price: number

    @IsNotEmpty()
    @IsInt()
    @Type(()=> Number)
    subcategoryId: number

    @IsNotEmpty()
    @IsInt()
    @Type(()=> Number)
    quantity: number

    @IsNotEmpty()
    @IsInt()
    @Type(()=> Number)
    colorId: number

    @IsNotEmpty()
    @IsInt()
    @Type(()=> Number)
    materialId: number

    @IsNotEmpty()
    @IsString()
    sku_code: string
}
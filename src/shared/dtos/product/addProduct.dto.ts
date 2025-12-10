import { IsInt, IsNotEmpty, IsPositive, IsString, IsArray, Matches, isInt } from "class-validator";

export class AddProductDto{
    @IsNotEmpty()
    @IsString()
    name: string

    @IsNotEmpty()
    @IsString()
    description: string

    @IsNotEmpty()
    @IsPositive()
    @Matches(/^\d+(\.\d{1,2})?$/, {
        message: "Le prix n'est pas au bon format(exemple: 15.99)."
    })
    price: number

    @IsNotEmpty()
    @IsArray()
    files: Express.Multer.File[]

    @IsNotEmpty()
    @IsInt()
    subcategoryId: number

    @IsNotEmpty()
    @IsInt()
    quantity: number

    @IsNotEmpty()
    @IsInt()
    colorId: number

    @IsNotEmpty()
    @IsInt()
    materialId: number

    @IsNotEmpty()
    @IsString()
    sku_code: string
}
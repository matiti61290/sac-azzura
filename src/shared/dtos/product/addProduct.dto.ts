import { isArray, IsBoolean, IsInt, IsNotEmpty, IsPositive, IsString, IsArray, Matches } from "class-validator";

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
    @IsBoolean()
    isActive: boolean
}
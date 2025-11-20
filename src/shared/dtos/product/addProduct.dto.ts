import { IsBoolean, IsInt, IsNotEmpty, IsPositive, IsString, IsUrl, Matches } from "class-validator";

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
    @IsUrl()
    imageUrl: string[]

    @IsNotEmpty()
    @IsInt()
    subcategoryId: number

    @IsNotEmpty()
    @IsBoolean()
    isActive: boolean
}
import { IsInt, IsNotEmpty, IsPositive, IsString } from "class-validator";

export class CartItemDto {
    @IsNotEmpty()
    @IsString()
    sku!: string

    @IsNotEmpty()
    @IsInt()
    @IsPositive()
    quantity!: number
}
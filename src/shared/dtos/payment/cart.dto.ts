import { Type } from "class-transformer";
import { IsArray, IsInt, IsNotEmpty, IsString, ValidateNested } from "class-validator";
import { CartItemDto } from "./cartItem.dto";

export class CartDto {
    @IsNotEmpty()
    @IsArray()
    @ValidateNested({ each: true})
    @Type(()=> CartItemDto)
    items: CartItemDto[]

    @IsNotEmpty()
    @IsInt()
    delivery_address_id: number

    @IsNotEmpty()
    @IsInt()
    billing_address_id: number
}
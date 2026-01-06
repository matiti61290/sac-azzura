import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, ValidateNested } from "class-validator";
import { CartItemDto } from "./cartItem.dto";

export class CartDto {
    @IsNotEmpty()
    @IsArray()
    @ValidateNested({ each: true})
    @Type(()=> CartItemDto)
    items: CartItemDto[]
}
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { AddressType } from "src/shared/enum/address.enum";

export class AddressDto {
    @IsEnum(AddressType)
    type: AddressType

    @IsNotEmpty()
    @IsString()
    street: string

    @IsOptional()
    @IsString()
    additionnal: string

    @IsNotEmpty()
    @IsString()
    zipcode: string

    @IsNotEmpty()
    @IsString()
    city: string
}
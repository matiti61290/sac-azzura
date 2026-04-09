import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { AddressType } from "../../enum/address.enum";

export class AddAddressDto {
    @IsEnum(AddressType)
    type!: AddressType

    @IsNotEmpty()
    @IsString()
    street!: string

    @IsOptional()
    @IsString()
    additionnal!: string

    @IsNotEmpty()
    @IsString()
    zipcode!: string

    @IsNotEmpty()
    @IsString()
    city!: string
}
import { IsEmail, IsOptional, IsPhoneNumber, IsString } from "class-validator"

export class UpdateUserDto {
    @IsString()
    @IsOptional()
    firstname!: string

    @IsString()
    @IsOptional()
    lastname!: string

    @IsEmail()
    @IsOptional()
    mail!: string

    @IsPhoneNumber('FR')
    @IsOptional()
    phoneNumber!: string

    @IsString()
    @IsOptional()
    password!: string
}
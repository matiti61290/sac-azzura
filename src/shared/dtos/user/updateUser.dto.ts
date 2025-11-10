import { IsEmail, IsPhoneNumber } from "class-validator"

export class UpdateUserDto {
    firstname: string

    lastname: string

    @IsEmail()
    mail: string

    @IsPhoneNumber()
    phoneNumber: string
}
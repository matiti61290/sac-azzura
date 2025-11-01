import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class MailDto {
    @IsNotEmpty()
    @IsEmail()
    @IsString()
    mail:string
}
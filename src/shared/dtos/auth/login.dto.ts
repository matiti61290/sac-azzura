import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class LoginDto {
    @IsNotEmpty()
    @IsEmail()
    @IsString()
    mail!: string;

    @IsNotEmpty()
    @IsString()
    password!: string
}
import { IsNotEmpty, IsString, Matches } from "class-validator";
import { Match } from "../../decorators/password_match.decorator";

export class NewPasswordDto {
    @IsNotEmpty()
    @IsString()
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
        message: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, un chiffre et un caractère spécial.'
    })
    password: string

    @IsNotEmpty()
    @IsString()
    @Match('password', {message: 'les mots de passe ne correspondent pas'})
    confirmPassword: string
}
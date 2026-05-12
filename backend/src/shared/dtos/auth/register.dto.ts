import { IsEmail, IsNotEmpty, IsPhoneNumber, IsString, Matches } from "class-validator";
import { Match } from "../../decorators/password_match.decorator";

export class RegisterDto {
    @IsNotEmpty({ message: 'Le prénom est obligatoire.' })
    @IsString({ message: 'Le prénom doit être une chaîne de caractères.' })
    firstname!: string

    @IsNotEmpty({ message: 'Le nom est obligatoire.' })
    @IsString({ message: 'Le nom doit être une chaîne de caractères.' })
    lastname!: string

    @IsNotEmpty({ message: "L'email est obligatoire." })
    @IsEmail({}, { message: "L'adresse email n'est pas au bon format." }) // <-- La correction est ici
    mail!: string

    @IsNotEmpty({ message: 'Le numéro de téléphone est obligatoire.' })
    @IsPhoneNumber('FR', { message: 'Le numéro de téléphone n\'est pas valide en France.' })
    phoneNumber!: string

    @IsNotEmpty({ message: 'Le mot de passe est obligatoire.' })
    @IsString()
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
        message: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, un chiffre et un caractère spécial.'
    })
    password!: string

    @IsNotEmpty({ message: 'La confirmation du mot de passe est obligatoire.' })
    @IsString()
    @Match('password', { message: 'Les mots de passe ne correspondent pas.' })
    confirmPassword!: string
}
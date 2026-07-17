import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { JwtService } from "@nestjs/jwt";
import { ConfirmMailService } from "./authMail/corfirmMail.service";
import * as bcrypt from 'bcrypt'
import { Response } from "express";
import { newPasswordMailService } from "./authMail/newPasswordMail.service";
import { UserEntity } from "../../entities/user.entity";
import { RegisterDto } from "../../shared/dtos/auth/register.dto";
import { MailDto } from "../../shared/dtos/auth/mail.dtos";
import { NewPasswordDto } from "../../shared/dtos/auth/newPassword.dto";


/**
 * Service for handling user authentication operations including registration, login, password reset, and email verification.
 */
@Injectable()
export class AuthService {
    /**
     * Injects the required dependencies into the service constructor.
     * @param userRepository The TypeORM repository for UserEntity operations.
     * @param jwtService The JWT service for creating and verifying tokens.
     * @param confirmMailService Service for sending email verification.
     * @param newPasswordMailService Service for sending password reset emails.
     */
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,

        private readonly jwtService: JwtService,
        private readonly confirmMailService: ConfirmMailService,
        private readonly newPasswordMailService: newPasswordMailService
    ) { }

    /**
     * Registers a new user account with the system.
     * @param registerDto - The registration data including firstname, lastname, mail, phone number, password, and confirmation password.
     * @returns The newly created UserEntity.
     * @throws BadRequestException - If passwords do not match.
     * @throws ConflictException - If an email is already registered.
     */
    async registration(registerDto: RegisterDto): Promise<UserEntity> {
        if (registerDto.password !== registerDto.confirmPassword){
            throw new BadRequestException('Les mots de passe ne correspondent pas.')
        }

        const existingUser = await this.userRepository.findOne({ where: {mail: registerDto.mail}})

        if(existingUser){
            throw new ConflictException('Cet email est deja utilisé.')
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(registerDto.password, salt)

        const newUser = this.userRepository.create({
            ...registerDto,
            password: hashedPassword
        })

        await this.userRepository.save(newUser)

        const token = this.jwtService.sign({ id: newUser.id, expiresIn: '1h'  })
        await this.confirmMailService.sendVerificationMail(newUser.mail, token)

        return newUser
    }

    /**
     * Validates a user account using a verification token sent during registration.
     * @param token - The verification token extracted from the email link.
     * @returns An object containing a success message confirming account validation.
     * @throws BadRequestException - If the token is expired or invalid.
     */
    async validateAccount(token: string) {
        let payload: any;

        try {
            payload = this.jwtService.verify(token);
        } catch (error: any) {
            if (error.name === 'TokenExpiredError') {
                throw new BadRequestException(
                    "Le lien de validation a expiré. Veuillez vous connecter sur le site pour demander un nouveau lien."
                );
            }
            throw new BadRequestException("Le lien de validation est invalide.");
        }

        const user = await this.userRepository.findOne({ where: { id: payload.id } });

        if (!user) {
            throw new NotFoundException('Utilisateur introuvable');
        }

        user.isVerified = true;
        await this.userRepository.save(user);

        return { message: 'Utilisateur validé avec succès' };
    }

    /**
     * Validates a user's credentials and returns the user data without sensitive information.
     * @param mail - The user's email address.
     * @param password - The user's password for authentication.
     * @returns The authenticated user data excluding the password field, or null if invalid.
     */
    async validateUser(mail: string, password: string): Promise<any> {
        const user = await this.userRepository.findOne({ where: { mail } })
        if(user && (await bcrypt.compare(password, user.password))) {
            const { password, ...result} = user
            return result
        }
        return null
    }

    /**
     * Authenticates a user and sets a JWT cookie for session management.
     * @param user - The authenticated user data containing mail, id, firstname, and isAdmin flags.
     * @param response - Express Response object for setting cookies.
     * @returns An object with success message and user payload.
     */
    async login(user: any, response: Response) {
        const payload = { mail: user.mail, id: user.id, firstname: user.firstname, isAdmin: user.isAdmin}
        const token = this.jwtService.sign(payload, { expiresIn: '1h' })

        response.cookie('jwt', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            maxAge: 60 * 60 * 1000
        })

        return { message: 'Connexion réussie', user: payload}
    }

    /**
     * Sends a password reset email to the specified user.
     * @param mailDto - The mail DTO containing the user's email address.
     */
    async sendMailForgetPassword(mailDto: MailDto) {
        const payload = {mail: mailDto.mail}
        const token = this.jwtService.sign(payload, {expiresIn: '1h'})

        await this.newPasswordMailService.sendNewPasswordMail(payload.mail, token)
    }

    /**
     * Decrypts a password reset token to retrieve the associated user information.
     * @param token - The password reset token extracted from the email link.
     * @returns The JWT payload containing mail and id, or throws an error if invalid/expired.
     */
    /////////////////////////////
    // Not yet implemented
    /////////////////////////////
    async forgetPassword(token: string) {
        const payload = this.jwtService.verify(token)
        return payload
    }

    /**
     * Changes a user's password after verifying the reset token.
     * @param newPasswordDto - The DTO containing new password and confirmation password.
     * @param token - The password reset token extracted from the email link.
     * @throws BadRequestException - If passwords do not match.
     * @throws NotFoundException - If user is not found or token payload lacks mail.
     */
    async changePassword(newPassword: NewPasswordDto, token: string) {
        const payload = this.jwtService.verify(token)

        if(!payload.mail){
            throw new NotFoundException
        }

        const user = await this.userRepository.findOne( { where: { mail: payload.mail }})

        if(!user) {
            throw new NotFoundException
        }

        if (newPassword.password !== newPassword.confirmPassword) {
            throw new BadRequestException('Les mots de passe ne correspondent pas')
        }
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(newPassword.password, salt)

        user.password = hashedPassword

        await this.userRepository.save(user)

        return
    }

    /**
     * Resends the email verification link to a pending account.
     * @param payload - The payload containing the user's ID from an expired verification token.
     * @returns An object with success message confirming the verification email was resent.
     * @throws NotFoundException - If the user is not found.
     * @throws BadRequestException - If the user's account is already verified.
     */
    async resendVerification(payload: any) {
    const user = await this.userRepository.findOne({ where: { id: payload.id } });

    if (!user) {
        throw new NotFoundException('Utilisateur introuvable');
    }

    if (user.isVerified) {
        throw new BadRequestException('Votre compte est déjà vérifié.');
    }

    const token = this.jwtService.sign({ id: user.id }, { expiresIn: '1h' });
    
    await this.confirmMailService.sendVerificationMail(user.mail, token);

    return { message: 'Mail de vérification renvoyé avec succès.' };
}
}
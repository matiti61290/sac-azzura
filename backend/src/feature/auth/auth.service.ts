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


@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,

        private readonly jwtService: JwtService,
        private readonly confirmMailService: ConfirmMailService,
        private readonly newPasswordMailService: newPasswordMailService
    ) { }

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

async validateAccount(token: string) {
        try {
            const payload = this.jwtService.verify(token)
            
            const user = await this.userRepository.findOne({ where: { id: payload.id }})

            if(!user){
                throw new NotFoundException('Utilisateur introuvable')
            }

            user.isVerified = true
            await this.userRepository.save(user)
            
            return { message: 'Utilisateur validé avec succès' }

        } catch (error: any) {
            if (error.name === 'TokenExpiredError') {
                throw new BadRequestException(
                    "Le lien de validation a expiré. Veuillez vous connecter sur le site pour demander un nouveau lien."
                )
            }
            
            throw new BadRequestException("Le lien de validation est invalide.")
        }
    }

    async validateUser(mail: string, password: string): Promise<any> {
        const user = await this.userRepository.findOne({ where: { mail } })
        if(user && (await bcrypt.compare(password, user.password))) {
            const { password, ...result} = user
            return result
        }
        return null
    }

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

    async sendMailForgetPassword(mailDto: MailDto) {
        const payload = {mail: mailDto.mail}
        const token = this.jwtService.sign(payload, {expiresIn: '1h'})

        await this.newPasswordMailService.sendNewPasswordMail(payload.mail, token)
    }

    //Not yet implemented
    async forgetPassword(token: string){
        const payload = this.jwtService.verify(token)
        return payload
    }

    async changePassword(newPassword: NewPasswordDto, token: string){
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
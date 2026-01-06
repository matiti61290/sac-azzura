import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { UserEntity } from "src/entities/user.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { RegisterDto } from "src/shared/dtos/auth/register.dto";
import { JwtService } from "@nestjs/jwt";
import { ConfirmMailService } from "./authMail/corfirmMail.service";
import * as bcrypt from 'bcrypt'
import { Response } from "express";
import { newPasswordMailService } from "./authMail/newPasswordMail.service";
import { MailDto } from "src/shared/dtos/auth/mail.dtos";
import { NewPasswordDto } from "src/shared/dtos/auth/newPassword.dto";
/**
 * Service s'occupant des fonctions liées à l'authentification comme l'inscription ou la connexion d'un utilisateur.
 */
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
        const payload = this.jwtService.verify(token)
        const user = await this.userRepository.findOne({ where: { id: payload.id }})

        if(!user){
            throw new NotFoundException('Utilisateur introuvable')
        }

        user.isVerified = true
        await this.userRepository.save(user)
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
        const payload = { mail: user.mail, sub: user.id}
        const token = this.jwtService.sign(payload, { expiresIn: '1h' })
        console.log('Token genere:', token)

        response.cookie('jwt', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            maxAge: 60 * 60 * 1000
        })

        return { message: 'Connexion réussie'}
    }

    async sendMailForgetPassword(mailDto: MailDto) {
        const payload = {mail: mailDto.mail}
        const token = this.jwtService.sign(payload, {expiresIn: '1h'})

        await this.newPasswordMailService.sendNewPasswordMail(payload.mail, token)
    }

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
}
import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { UserEntity } from "src/entities/user.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { RegisterDto } from "src/shared/dtos/register.dto";
import { JwtService } from "@nestjs/jwt";
import { ConfirmMailService } from "./mail.service";
import * as bcrypt from 'bcrypt'
import { Response } from "express";
/**
 * Service s'occupant des fonctions liées à l'authentification comme l'inscription ou la connexion d'un utilisateur.
 */
@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,

        private readonly jwtService: JwtService,
        private readonly confirmMailService: ConfirmMailService
    ) {
        console.log('Authservice instancie')
    }

    async registration(registerDto: RegisterDto): Promise<UserEntity> {
        if (registerDto.password !== registerDto.confirmPassword){
            throw new BadRequestException('Les mots de passe ne correspondent pas.')
        }

        const existingUser = await this.userRepository.findOne({ where: {mail: registerDto.mail}})

        if(existingUser){
            throw new ConflictException('et email est deja utilisé.')
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(registerDto.password, salt)

        const newUser = this.userRepository.create({
            ...registerDto,
            password: hashedPassword
        })

        await this.userRepository.save(newUser)

        const token = this.jwtService.sign({ id: newUser.id })
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
}
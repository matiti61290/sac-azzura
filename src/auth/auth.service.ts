import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { UserEntity } from "src/entities/user.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { RegisterDto } from "src/shared/dtos/register.dto";
import { JwtService } from "@nestjs/jwt";
import { ConfirmMailService } from "./mail.service";
import * as bcrypt from 'bcrypt'

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
    ) {}

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

    async validateUser(token: string) {
        const payload = this.jwtService.verify(token)
        const user = await this.userRepository.findOne({ where: { id: payload.id }})

        if(!user){
            throw new NotFoundException('Utilisateur introuvable')
        }

        user.isVerified = true
        await this.userRepository.save(user)
    }
}
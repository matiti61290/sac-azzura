import { BadRequestException, ConflictException, Injectable } from "@nestjs/common";
import { UserEntity } from "src/entities/user.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { RegisterDto } from "src/shared/dtos/register.dto";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from 'bcrypt'

/**
 * Service s'occupant des fonctions liées à l'authentification comme l'inscription ou la connexion d'un utilisateur.
 */
@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,

        // private readonly jwtService: JwtService
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

        // const token = this.jwtService.sign({ id: newUser.id })
        // await this.

        return newUser
    }
}
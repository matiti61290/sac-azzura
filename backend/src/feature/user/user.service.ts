import {Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserEntity } from "../../entities/user.entity";
import { UpdateUserDto } from "../../shared/dtos/user/updateUser.dto";
import * as bcrypt from 'bcrypt'

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>
    ) {}

    async getAllUser(){
        const users = await this.userRepository.find()
        
        if(!users){
            throw new NotFoundException 
        }

        return users
    }

    async findUserById(userId: number) {
        const user = await this.userRepository.findOne({ 
            where: { id: userId }, 
            relations: ['orders', 'addresses'] 
        })

        if (!user) {
            throw new NotFoundException()
        }

        if (user.addresses) {
            user.addresses.forEach(address => delete (address as any).user)
        }
        
        if (user.orders) {
            user.orders.forEach(order => delete (order as any).user)
        }

        return user
    }

    async updateUser(userId: number, updateUserdto: UpdateUserDto) {
        const user = await this.userRepository.findOne({ where: { id: userId } })

        if (!user) {
            throw new NotFoundException("Utilisateur non trouvé")
        }

        // 1. On extrait le password pour le traiter à part, le reste va dans 'updateData'
        const { password, ...updateData } = updateUserdto

        // 2. On applique d'abord les changements textuels (firstname, lastname, mail, phoneNumber)
        Object.assign(user, updateData)

        // 3. Si un nouveau mot de passe est fourni, on le hache et on l'assigne DIRECTEMENT à l'entité
        if (password && password.trim() !== "") {
            const salt = await bcrypt.genSalt(10) // 10 est le nombre de rounds standard
            user.password = await bcrypt.hash(password, salt)
        }

        // 4. On sauvegarde l'entité qui contient maintenant le mot de passe haché
        return this.userRepository.save(user)
    }

    async deleteUser (userId){
        const user = await this.userRepository.findOne({ where: {id: userId}})

        if(!user) {
            throw new NotFoundException
        }

        return this.userRepository.remove(user)
    }
}
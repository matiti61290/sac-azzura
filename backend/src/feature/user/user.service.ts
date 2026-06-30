import {Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserEntity } from "../../entities/user.entity";
import { UpdateUserDto } from "../../shared/dtos/user/updateUser.dto";


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

        // ✂️ ON CASSE LA BOUCLE CIRCULAIRE ICI
        // On retire la propriété 'user' de chaque adresse et chaque commande
        // (Ne t'inquiète pas, ça ne supprime rien en base de données, ça nettoie juste le JSON envoyé !)
        if (user.addresses) {
            user.addresses.forEach(address => delete (address as any).user)
        }
        
        if (user.orders) {
            user.orders.forEach(order => delete (order as any).user)
        }

        return user
    }

    async updateUser(userId: number, updateUserdto: UpdateUserDto) {
        const user = await this.userRepository.findOne({ where: {id: userId}})

        if(!user){
            throw new NotFoundException
        }

        Object.assign(user, updateUserdto)

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
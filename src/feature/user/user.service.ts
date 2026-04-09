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
        const users = this.userRepository.find()
        
        if(!users){
            throw new NotFoundException 
        }
    }

    async findUserById(userId: number) {
        const user = this.userRepository.findOne({ where: {id: userId}})

        if(!user) {
            throw new NotFoundException
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
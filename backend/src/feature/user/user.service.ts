import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserEntity } from "../../entities/user.entity";
import { UpdateUserDto } from "../../shared/dtos/user/updateUser.dto";
import * as bcrypt from 'bcrypt'

/**
 * Service for managing user accounts (CRUD operations).
 */
@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>
    ) {}

    /**
     * Retrieves all users from the database.
     * @returns An array of UserEntity instances representing all registered users.
     */
    async getAllUser(){
        const users = await this.userRepository.find()
        
        if(!users){
            throw new NotFoundException 
        }

        return users
    }

    /**
     * Finds and returns a specific user by their unique ID.
     * Populates related orders and addresses for the user.
     * Removes sensitive user references from related entities to protect privacy.
     * @param userId - The unique identifier of the user to retrieve.
     * @returns The UserEntity with all relations populated if found.
     * @throws NotFoundException - If no user exists with the given ID.
     */
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

    /**
     * Updates a user's information in the database.
     * Automatically hashes passwords for security when updating.
     * @param userId - The unique identifier of the user to update.
     * @param updateUserDto - DTO containing the updated user fields (name, email, etc.).
     * @returns The updated and saved UserEntity.
     * @throws NotFoundException - If no user exists with the given ID.
     */
    async updateUser(userId: number, updateUserDto: UpdateUserDto) {
        const user = await this.userRepository.findOne({ where: { id: userId } })

        if (!user) {
            throw new NotFoundException("Utilisateur non trouvé")
        }

        const { password, ...updateData } = updateUserDto

        Object.assign(user, updateData)

        if (password && password.trim() !== "") {
            const salt = await bcrypt.genSalt(10)
            user.password = await bcrypt.hash(password, salt)
        }

        return this.userRepository.save(user)
    }

    /**
     * Permanently deletes a user from the database.
     * @param userId - The unique identifier of the user to delete.
     * @throws NotFoundException - If no user exists with the given ID.
     */
    async deleteUser (userId){
        const user = await this.userRepository.findOne({ where: {id: userId}})

        if(!user){
            throw new NotFoundException
        }

        return this.userRepository.remove(user)
    }
}
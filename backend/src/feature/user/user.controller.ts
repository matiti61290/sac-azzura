import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { UsersService } from "./user.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { UpdateUserDto } from "../../shared/dtos/user/updateUser.dto";
import { AdminGuard } from "../auth/guards/admin.guard";

@Controller('user')
export class UserController{
    constructor(
        private readonly userService : UsersService
    ) {}

    @Get('')
    @UseGuards(JwtAuthGuard, AdminGuard)
    async getAllUsers () {
        return this.userService.getAllUser()
    }

    @Get('/:userId')
    @UseGuards(JwtAuthGuard)
    async findUserById(
        @Param('userId', ParseIntPipe) userId: number
    ) {
        console.log("le controller est appele")
        return this.userService.findUserById(userId)
    }

    @Patch('update-user/:userId')
    @UseGuards(JwtAuthGuard)
    async updateUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() updateUserDto: UpdateUserDto
    ) {
        return this.userService.updateUser(userId, updateUserDto)
    }

    @Delete('delete-user/:userId')
    @UseGuards(JwtAuthGuard)
    async deleteUser (
        @Param('userId', ParseIntPipe) userId: number
    ) {
        return this.userService.deleteUser(userId)
    }
}
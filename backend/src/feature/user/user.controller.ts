import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from "@nestjs/common";
import { UsersService } from "./user.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { UpdateUserDto } from "../../shared/dtos/user/updateUser.dto";

@Controller('user')
export class UserController{
    constructor(
        private readonly userService : UsersService
    ) {}

    @Get('')
    async getAllUsers () {
        return this.userService.getAllUser()
    }

    @Get('/:userId')
    async findUserById(
        @Param('userId', ParseIntPipe) userId: number
    ) {
        return this.userService.findUserById(userId)
    }

    @Post('update-user/:userId')
    @UseGuards(JwtAuthGuard)
    async updateUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() updateUserDto: UpdateUserDto
    ) {
        return this.userService.updateUser(userId, updateUserDto)
    }

    @Post('delete-user/:userId')
    @UseGuards(JwtAuthGuard)
    async deleteUser (
        @Param('userId', ParseIntPipe) userId: number
    ) {
        return this.userService.deleteUser(userId)
    }
}
import { Body, Controller, Get, Post, Query, Req, Res, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "src/shared/dtos/register.dto";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import type { Request, Response, } from "express";


@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ){}

    @Post('register')
    @UsePipes( new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true}))
    async registrationUser(@Body() registerDto: RegisterDto){
        return this.authService.registration(registerDto)
    }

    @Get('validation-user')
    async validationUser(@Query('token') token: string){
        await this.authService.validateAccount(token)
        return { message: 'Utilisateur valide'}
    }

    @Post('login')
    @UseGuards(LocalAuthGuard)
    async login(@Req() req: Request, @Res({ passthrough: true }) response: Response) {
        return this.authService.login(req.user, response)
    }

    @Get('profile')
    @UseGuards(JwtAuthGuard)
    async getProfile(@Req() req: Request) {
        return req.user
    }
}
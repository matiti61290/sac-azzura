import { Body, Controller, Get, Post, Query, Req, Res, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "src/shared/dtos/auth/register.dto";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import type { Request, Response, } from "express";
import { MailDto } from "src/shared/dtos/auth/mail.dtos";
import { NewPasswordDto } from "src/shared/dtos/auth/newPassword.dto";


@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
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

    @Post('mail-forget-password')
    async mailForgetPassword(@Body() mailDto: MailDto){
        return this.authService.sendMailForgetPassword(mailDto)
    }

    @Get('forget-password')
    async forgetPassword(@Query('token') token: string) {
        return this.authService.forgetPassword(token)
    }

    //A tester avec un template
    @Post('change-password')
    async changePassword(@Query('token') token: string ,
    @Body() newPasswordDto: NewPasswordDto){
        return this.authService.changePassword(newPasswordDto, token)
    }
}
import { Body, Controller, Get, Post, UsePipes, ValidationPipe } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "src/shared/dtos/register.dto";

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

    @Get('validation')
    async validationUser(){
        return 'the controller works'
    }
}
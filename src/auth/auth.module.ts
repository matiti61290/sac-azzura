import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "src/entities/user.entity";
import { JwtModule } from "@nestjs/jwt";
import { ConfirmMailService } from "./mail.service";

@Module({
    imports:[TypeOrmModule.forFeature([UserEntity]),
        JwtModule.register({
            secret: process.env.JWT_SECRET
        })],
    controllers: [AuthController],
    providers: [AuthService, ConfirmMailService],
    exports:[AuthService, JwtModule]
})

export class AuthModule {}
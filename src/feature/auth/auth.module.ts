import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "src/entities/user.entity";
import { JwtModule } from "@nestjs/jwt";
import { ConfirmMailService } from "./authMail/corfirmMail.service";
import * as dotenv from 'dotenv'
import { PassportModule } from "@nestjs/passport";
import { LocalStrategy } from "./strategies/local.strategy"
import { JwtStrategy } from "./strategies/jwt.strategy"
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { newPasswordMailService } from "./authMail/newPasswordMail.service";

dotenv.config()

@Module({
    imports:[TypeOrmModule.forFeature([UserEntity]),
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: {expiresIn: '60s'}
        }),
        PassportModule.register({ defaultStrategy: 'local'})],
    controllers: [AuthController, ],
    providers: [AuthService, ConfirmMailService, LocalStrategy, JwtStrategy, JwtAuthGuard, newPasswordMailService],
    exports:[AuthService, JwtModule]
})

export class AuthModule {}
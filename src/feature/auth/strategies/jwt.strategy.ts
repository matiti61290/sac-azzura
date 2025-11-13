import { Injectable, NotFoundException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-jwt";
import { Request } from "express";
import { UsersService } from "src/feature/user/user.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly userService: UsersService
    ) {
        super({
            jwtFromRequest: (request:Request) => {
                console.log('Cookies:', request.cookies)
                return request.cookies?.jwt
            },
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET as string
        })
    }

    async validate(payload: any) {
        const user = await this.userService.findUserById(payload.sub)
        if (!user) {
            throw new NotFoundException
        }

        return user
    }
}
import { Injectable, NotFoundException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-jwt";
import { Request } from "express";
import { UsersService } from "../../user/user.service";


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly userService: UsersService
    ) {
        super({
            jwtFromRequest: (request:Request) => {
                return request.cookies?.jwt
            },
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET as string
        })
    }

    async validate(payload: any) {
        const user = await this.userService.findUserById(payload.id)
        if (!user) {
            throw new NotFoundException
        }

        return user
    }
}
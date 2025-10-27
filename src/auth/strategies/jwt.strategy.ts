import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-jwt";
import { Request } from "express";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
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
        return { userId: payload.sub, mail: payload.mail }
    }
}
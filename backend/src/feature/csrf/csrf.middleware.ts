import { Injectable, NestMiddleware, UnauthorizedException } from "@nestjs/common";
import { doubleCsrf } from "csrf-csrf";
import { NextFunction, Request, Response } from "express";

const {
    doubleCsrfProtection,
    generateCsrfToken
} = doubleCsrf({
    getSecret: () => "OneKey", //a changer en prod
    getSessionIdentifier: (req: Request) => {
        return req.cookies['session-id'] || 'anonymous'
    },
    cookieName: 'x-csrf-token',
    cookieOptions: {
        sameSite: 'none',
        path: '/',
        secure: true //a mettre en true quand en prod
    }
})

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction){
        doubleCsrfProtection(req, res, (err) => {
            if(err) {
                throw new UnauthorizedException('Invalid CSRF Token', err.message)
            }
            next()
        })
    }
}

export { generateCsrfToken }
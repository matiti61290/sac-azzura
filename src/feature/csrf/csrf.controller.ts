import { Controller, Get, Req, Res } from "@nestjs/common";
import { randomUUID } from "crypto";
import type { Request, Response } from "express";
import { generateCsrfToken } from "./csrf.middleware";

@Controller('csrf')
export class CsrfController {
    @Get('token')
    getToken(@Req() req: Request, @Res() res: Response) {
        if(!req.cookies['session-id']){
            const sessionId = randomUUID()
            res.cookie('session-id', sessionId, {
                sameSite: 'none',
                path: '/',
                secure: false, //A mettre en true en prod
                httpOnly: false
            })
            req.cookies['session-id'] = sessionId
        }
        const token = generateCsrfToken(req, res)
        return res.json({ csrfToken: token})
    }
}
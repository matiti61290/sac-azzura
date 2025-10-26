import { Injectable } from "@nestjs/common";
import * as nodemailer from 'nodemailer'

@Injectable()
export class ConfirmMailService {
    private transporter = nodemailer.createTransport({
        service: 'gmail',
        auth:{
            user: process.env.USER_MAIL,
            pass: process.env.PASSWORD_MAIL
        }
    })

    async sendVerificationMail(mail: string, token: string) {
        const link = `localhost:3000/auth/validation?token=${token}`
        await this.transporter.sendMail({
            from: 'ichigo61290@gmail.com',
            to: mail,
            text: `Cliquez ici pour valider l'activation du compte : ${link}`,
            html: `<a href="${link}">Activer mon compte</a>`
        })
    }
}
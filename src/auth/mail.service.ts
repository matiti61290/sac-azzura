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
        const link = `http://localhost:3000/auth/validation-user?token=${token}`
        await this.transporter.sendMail({
            from: 'barbeymathieudev@gmail.com',
            to: mail,
            subject: 'Validation de votre compte',
            text: `Cliquez ici pour valider l'activation du compte : ${link}`,
            html: `
                <div>
                    <h1>Merci de votre inscription</h1>
                    <h3>Valider des maintenant votre compte!</h3>
                    <Cliquez sur ce <a href="${link}">lien </a> pour valider votre compte.</p>
                </div>
            `
        })
    }
}
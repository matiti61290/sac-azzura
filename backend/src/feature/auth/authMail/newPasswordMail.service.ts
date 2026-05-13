import { Injectable } from "@nestjs/common";
import * as nodemailer from 'nodemailer'

@Injectable()
export class newPasswordMailService {
    private transporter = nodemailer.createTransport({
        service: 'gmail',
        auth:{
            user: process.env.USER_MAIL,
            pass: process.env.PASSWORD_MAIL
        }
    })

    async sendNewPasswordMail(mail:string, token: string) {
        const link = `http://localhost:3001/auth/forget-password?token=${token}`
        await this.transporter.sendMail({
            from: 'barbeymathieudev@gmail.com',
            to: mail,
            subject: 'Changement de mot de passe',
            text: `Cliquez sur ce lien pour modifier votre mot de passe: ${link}`,
            html: `
                <div>
                    <h3>Changer votre mot de passe en cliquant sur le lien ci-dessous:</h3>
                    <a href="${link}">${link}</a>
                </div>
            `
        })
    }
}
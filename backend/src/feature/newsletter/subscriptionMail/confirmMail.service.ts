import { Injectable } from "@nestjs/common";
import * as nodemailer from 'nodemailer'

@Injectable()
export class SubscriptionConfirmMail {
        private transporter = nodemailer.createTransport({
            service: 'gmail',
            auth:{
                user: process.env.USER_MAIL,
                pass: process.env.PASSWORD_MAIL
            }
        })

        async sendSubscriptionConfirmMail (mail: string, token:string) {
            const link = `http://localhost:3001/newsletter/verify?token=${token}`
            await this.transporter.sendMail({
                            from: 'barbeymathieudev@gmail.com',
            to: mail,
            subject: 'Validation de votre compte',
            text: `Cliquez ici pour valider l'activation du compte : ${link}`,
            html: `
                <div>
                    <h1>Merci de votre inscription a la newsletter!</h1>
                    <p>Cliquez sur ce <a href="${link}">lien</a> pour confirmer l'abonnement</p>
                </div>
            `
            })
        }
}
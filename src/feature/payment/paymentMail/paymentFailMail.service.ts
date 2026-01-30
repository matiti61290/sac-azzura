import { Injectable } from "@nestjs/common";
import * as nodemailer from 'nodemailer'

@Injectable()
export class paymentFailMailService {
    private transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.USER_MAIL,
            pass: process.env.PASSWORD_MAIL
        }
    })

    async sendPaymentFailMail (orderId: number, mail: string) {
        await this.transporter.sendMail({
            from: 'barbeymathieudev@gmail.com',
            to: mail,
            subject: 'Erreur de paiement',
            text: 'Le paiement a echoue',
            html: `
            <div>
                <h1>Error lors du paiement</h1>
                <p> Votre commande ${orderId} n'a pas pu etre validee. Veuillez verifier votre moyen de paiement</p>
            </div>`
        })
    }
}
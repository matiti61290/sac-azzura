import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as nodemailer from 'nodemailer'
import { from, Subject } from "rxjs";
import { OrderEntity } from "src/entities/order.entity";
import { Repository } from "typeorm";

@Injectable()
export class PaymentSuccessMailService {

    constructor(
        @InjectRepository(OrderEntity)
        private readonly orderRepository: Repository<OrderEntity>
    ){}
    private transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.USER_MAIL,
            pass: process.env.PASSWORD_MAIL
        }
    })

    async sendPaymentSuccessMail(mail: string, orderId: number) {
        const order = await this.orderRepository.findOne({ where: {id: orderId}})

      await this.transporter.sendMail({
        from: 'barbeymathieudev@gmail.com',
        to: mail,
        subject: 'Confirmation de paiement',
        text: 'Votre paiement a ete valide',
        html: `
            <div>
                <h3>Votre paiement pour la commande ${orderId} a ete valide</h3>
                <p>Liste de la commande a implementer</p>
            </div>
        `
      })
    }
}
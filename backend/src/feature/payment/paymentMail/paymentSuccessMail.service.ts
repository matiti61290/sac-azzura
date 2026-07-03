import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as nodemailer from 'nodemailer'
import { Repository } from "typeorm";
import { OrderEntity } from "../../../entities/order.entity";

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
        text: 'Votre paiement a été validé',
        html: `
            <div>
                <h3>Votre paiement pour la commande ${orderId} a été validé</h3>
                <p>Liste de la commande a implementer</p>
            </div>
        `
      })
    }
}
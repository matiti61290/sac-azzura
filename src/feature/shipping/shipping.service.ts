import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { MondialRelayService } from "./service/mondial-relai.service";
import { ColissimoService } from "./service/colissimo.service";
import { InjectRepository } from "@nestjs/typeorm";
import { OrderEntity } from "src/entities/order.entity";
import { Repository } from "typeorm";
import { Order } from "src/shared/interfaces/order.interface";
import { AwsS3Service } from "../aws-s3/aws-s3.service";

@Injectable()
export class ShippingService {
    constructor(
        private readonly mondialRelaiService: MondialRelayService,

        private readonly colissimoService: ColissimoService,

        private readonly awsS3Service: AwsS3Service,

        @InjectRepository(OrderEntity)
        private readonly orderRepository: Repository<OrderEntity>
    ){}

    async getLabelUrlByOrder(orderId: number) {
        const order = await this.orderRepository.findOne({ where: {id: orderId}})

        if(!order) {
            throw new NotFoundException('Pas de commande a cette id')
        }

        const details = order.shippingDetails

        if(!details) {
            throw new InternalServerErrorException('Pas de details sur cette commande')
        }

        if(details.carrier === 'MONDIAL_RELAY') {
            return details.labelUrl
        }

        if(details.carrier === 'COLISSIMO') {
            if(!details.labelS3Key){
                throw new Error('Clé S3 introuvable')
            }

            return await this.awsS3Service.getFileUrl(details.labelS3Key)
        }
    }
}
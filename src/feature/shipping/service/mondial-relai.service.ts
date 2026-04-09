import { Injectable, OnModuleInit, Logger, HttpStatus, HttpException, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as soap from 'soap';
import { createHash } from 'crypto';
import { XMLParser } from 'fast-xml-parser';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FindRelayPointDto } from '../../../shared/dtos/mondial_relai/findRelayPoint.dto';
import { CreateLabelDto } from '../../../shared/dtos/mondial_relai/createLabelDto.dto';
import { OrderEntity } from '../../../entities/order.entity';
import { OrderStatus } from '../../../shared/enum/order.enum';
import { Carrier } from '../../../shared/enum/carrier.enum';
import { ServiceError } from '../../../shared/interfaces/serviceError.interface';

@Injectable()
export class MondialRelayService implements OnModuleInit {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>
  ){}

  private readonly logger = new Logger(MondialRelayService.name);
  private readonly webhookSecret = process.env.MONDIAL_RELAY_WEBHOOK_SECRET;
  private client: any;

  // API V1 SOAP
  private readonly apiV1Brand = process.env.MONDIAL_RELAY_API_V1_BRAND;
  private readonly apiV1PrivateKey = process.env.MONDIAL_RELAY_API_V1_PRIVATE_KEY;
  private readonly apiV1Url = process.env.MONDIAL_RELAY_API_V1_URL;

  // API 2 REST
  private readonly apiV2Brand = process.env.MONDIAL_RELAY_API_V2_BRAND;
  private readonly apiV2Mail = process.env.MONDIAL_RELAY_API_V2_MAIL;
  private readonly apiV2Password = process.env.MONDIAL_RELAY_API_V2_PASSWORD;
  private readonly apiV2Url = process.env.MONDIAL_RELAY_API_V2_URL;

  async onModuleInit() {
    if(!this.apiV1Url){
      throw new InternalServerErrorException('Probleme url api V1');
    }
    try {
      this.client = await soap.createClientAsync(this.apiV1Url, {
        forceSoap12Headers: true,
        endpoint: 'https://api.mondialrelay.com/Web_Services.asmx',
      });
      this.logger.log('Mondial Relay : Client SOAP (V1) prêt');
    } catch (error) {
      if(error instanceof Error){
        this.logger.error(`Erreur WSDL : ${error.message}`);
      }
    }
  }

  async rechercherPointsRelais(findRelayPointDto: FindRelayPointDto): Promise<any> {
    if (!this.client) return { success: false, message: 'Client non prêt' };

    const soapArgs = {
      Enseigne: this.apiV1Brand,
      Pays: 'FR',
      NumPointRelais: '',
      Ville: '',
      CP: findRelayPointDto.zipcode,
      Latitude: '',
      Longitude: '',
      Taille: '',
      Poids: '',
      Action: '24R',
      DelaiEnvoi: '0',
      RayonRecherche: '20',
      TypeActivite: '',
      NACE: '',
      NombreResultats: '10',
    };

    const securityString =
      this.apiV1Brand +
      soapArgs.Pays +
      soapArgs.NumPointRelais +
      soapArgs.Ville +
      soapArgs.CP +
      soapArgs.Latitude +
      soapArgs.Longitude +
      soapArgs.Taille +
      soapArgs.Poids +
      soapArgs.Action +
      soapArgs.DelaiEnvoi +
      soapArgs.RayonRecherche +
      soapArgs.TypeActivite +
      soapArgs.NACE +
      soapArgs.NombreResultats +
      this.apiV1PrivateKey;

    const security = createHash('md5').update(securityString).digest('hex').toUpperCase();

    try {
      const [result] = await this.client.WSI4_PointRelais_RechercheAsync(
        { ...soapArgs, Security: security },
        { forceSoap12Headers: true } 
      );

      const data = result.WSI4_PointRelais_RechercheResult;

      return {
        success: data.STAT === '0',
        stat: data.STAT,
        points: data.PointsRelais?.PointRelais_Details || []
      };
    } catch (error) {
      if (error instanceof Error){
        const serviceError = error as ServiceError

        if (serviceError.response?.data) {
          this.logger.error("Reponse d'erreur du serveur recue")
        }
        return { success: false, message: serviceError.message}
      }
    }
  }

  async createLabel(createLabelDto: CreateLabelDto): Promise<any> {
    if(!this.apiV2Url){
      throw new InternalServerErrorException('Probleme d\'url de l\'api');
    }
    const xmlPayload = `<?xml version="1.0" encoding="utf-8"?>
<ShipmentCreationRequest xmlns="http://www.example.org/Request">
    <Context>
        <Login>${this.apiV2Mail}</Login>
        <Password>${this.apiV2Password}</Password>
        <CustomerId>${this.apiV2Brand}</CustomerId>
        <Culture>fr-FR</Culture>
        <VersionAPI>1.0</VersionAPI>
    </Context>
    
    <OutputOptions>
        <OutputFormat>10x15</OutputFormat>
        <OutputType>PdfUrl</OutputType>
    </OutputOptions>
    
    <ShipmentsList>
        <Shipment>
            <OrderNo>CMD-12345</OrderNo>
            <CustomerNo>${this.apiV2Brand}</CustomerNo>
            <ParcelCount>1</ParcelCount>
            <DeliveryMode Mode="24R" Location="FR-${createLabelDto.relayId}" />
            <CollectionMode Mode="CCC" Location="" />
            
            <Parcels>
                <Parcel>
                    <Content>Livres</Content>
                    <Weight Value="1000" Unit="gr"/>
                </Parcel>
            </Parcels>

            <Sender>
                <Address>
                    <Title>Mr</Title>
                    <Firstname>Jean</Firstname>
                    <Lastname>Marchand</Lastname>
                    <Streetname>Rue du commerce</Streetname>
                    <HouseNo>1</HouseNo>
                    <CountryCode>FR</CountryCode>
                    <PostCode>59000</PostCode>
                    <City>Lille</City>
                </Address>
            </Sender>
            
            <Recipient>
                <Address>
                    <Title>Mr</Title>
                    <Firstname>Jean</Firstname>
                    <Lastname>Dupont</Lastname>
                    <Streetname>Rue de la Paix</Streetname>
                    <HouseNo>10</HouseNo>
                    <CountryCode>FR</CountryCode>
                    <PostCode>75000</PostCode>
                    <City>Paris</City>
                </Address>
            </Recipient>
        </Shipment>
    </ShipmentsList>
</ShipmentCreationRequest>`.trim();

    try {
      const response = await fetch(this.apiV2Url, {
        method: 'POST',
        headers: {
          'Accept': 'application/xml',
          'Content-Type': 'text/xml',
        },
        body: xmlPayload,
      });

      const responseText = await response.text();

      if (!response.ok) {
        throw new HttpException(
          "Erreur lors de la communication avec l'API Mondial Relay",
          response.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      
      const parser = new XMLParser({ ignoreAttributes: false });
      const parsedJson = parser.parse(responseText);

      const statusNode = parsedJson?.ShipmentCreationResponse?.StatusList?.Status;
      const statusCode = statusNode ? (statusNode['@_Code'] || statusNode.Code) : null;

      if (statusCode === "0") {
          const shipmentNode = parsedJson.ShipmentCreationResponse.ShipmentsList.Shipment;
          const pdfUrl = shipmentNode.LabelList.Label.Output;
          const trackingNumber = shipmentNode['@_ShipmentNumber'] || shipmentNode.ShipmentNumber;

          const order = await this.orderRepository.findOne({ where: {id: createLabelDto.orderId}});

          if(!order){
            throw new InternalServerErrorException("La commande n'a pas été trouvée");
          }

          order.trackingNumber = trackingNumber;
          order.carrier = Carrier.MONDIAL_RELAY;
          order.shippedAt = new Date();

          const currentDetails = order.shippingDetails?.carrier === Carrier.MONDIAL_RELAY 
            ? order.shippingDetails 
            : { relayPointId: createLabelDto.relayId };

          order.shippingDetails = {
            ...currentDetails,
            carrier: Carrier.MONDIAL_RELAY,
            relayPointId: createLabelDto.relayId,
            labelUrl: pdfUrl
          };

          await this.orderRepository.save(order);
          
          return {
              success: true,
              trackingNumber: trackingNumber,
              pdfUrl: pdfUrl
          };
      } else {
          return {
              success: false,
              message: "Erreur lors de la création de l'étiquette (Erreur Métier)",
              details: statusNode
          };
      }

    } catch (error) {
      if (error instanceof Error){
        const serviceError = error as ServiceError

        if(serviceError.response?.data){
          throw new HttpException(error.message || "Erreur interne", HttpStatus.INTERNAL_SERVER_ERROR);
        }
      }
      
    }
  }

  async tracingPackage(orderId: number) {
    if (!this.client) return { success: false, message: 'Client non prêt' };

    const order = await this.orderRepository.findOne({ where: { id: orderId } });

    if (!order || !order.trackingNumber) {
      throw new NotFoundException("Aucune commande trouvée ou pas de numéro de suivi");
    }

    const cacheDurationMs = 4 * 60 * 60 * 1000;
    const now = new Date();
    
    if(order.lastTrackingUpdate && (now.getTime() - order.lastTrackingUpdate.getTime() < cacheDurationMs) && order.shippingDetails?.carrier === Carrier.MONDIAL_RELAY) {
      this.logger.log(`Renvoi des données en cache de la commande ${order.id}`);
      return {
        success: true,
        stat: order.shippingDetails.stat,
        tracing: order.shippingDetails.tracing,
        cached: true
      };
    }

    const soapArg = {
      Enseigne: this.apiV1Brand,
      Expedition: order.trackingNumber, 
      Langue: 'FR'
    };

    const securityString = soapArg.Enseigne + soapArg.Expedition + soapArg.Langue + this.apiV1PrivateKey;
    const security = createHash('md5').update(securityString).digest('hex').toUpperCase();

    try {
      const [result] = await this.client.WSI2_TracingColisDetailleAsync(
        { ...soapArg, Security: security },
        { forceSoap12Headers: true }
      );

      const data = result.WSI2_TracingColisDetailleResult;
      const successStatuses = ['0', '80', '81', '82', '83'];
      const isSuccess = successStatuses.includes(data.STAT?.toString());

      if(isSuccess) {
        order.lastTrackingUpdate = now;

        const currentDetails = order.shippingDetails?.carrier === Carrier.MONDIAL_RELAY 
            ? order.shippingDetails 
            : { relayPointId: 'UNKNOWN' };

        order.shippingDetails = {
          ...currentDetails,
          carrier: Carrier.MONDIAL_RELAY,
          stat: data.STAT,
          tracing: data.Tracing,
        };

        await this.orderRepository.save(order);
      }

      return {
        success: isSuccess,
        stat: data.STAT,
        tracing: data.Tracing,
        cached: false
      };
    } catch (error) {
      if(error instanceof Error){
        const serviceError = error as ServiceError

        if(serviceError.response?.data){
          this.logger.error("Reponse d'erreur du serveur recue")
        }
        return { success: false, message: error.message}
      }
    }
  }

  async handleWebhook(payload: any, token: string) {
    // 1. SÉCURITÉ : On vérifie que la requête vient bien de quelqu'un qui connaît le secret
    if (!this.webhookSecret || token !== this.webhookSecret) {
      this.logger.error("Tentative d'accès non autorisé au webhook Mondial Relay");
      // On jette une 401. La requête est rejetée.
      throw new UnauthorizedException('Token invalide ou manquant'); 
    }

    this.logger.log('Payload Webhook reçu :', payload);

    const trackingNumber = payload.Expedition || payload.tracking_number;
    const statusCode = payload.Status || payload.CodeEtape;

    if(!trackingNumber) {
      this.logger.warn('Webhook reçu mais aucun numéro de tracking trouvé.');
      return; // On utilise "return" pour envoyer un 200 OK et stopper l'exécution
    }

    const order = await this.orderRepository.findOne({ where: { trackingNumber } });

    if(!order) {
      // On logue l'info, MAIS ON NE JETTE PLUS D'ERREUR 500 !
      // Cela évite que Mondial Relay ne relance la requête en boucle.
      this.logger.warn(`Webhook ignoré : Le colis avec le tracking number ${trackingNumber} n'existe pas en BDD`);
      return; 
    }

    // --- À partir d'ici, ton code était déjà très bon, je l'ai juste ajusté pour l'interface ---
    
    order.lastTrackingUpdate = new Date();

    const currentDetails = order.shippingDetails?.carrier === Carrier.MONDIAL_RELAY 
        ? order.shippingDetails 
        : { relayPointId: 'UNKNOWN' };

    order.shippingDetails = {
      ...currentDetails,
      carrier: Carrier.MONDIAL_RELAY,
      latestStatus: statusCode,
      updateViaWebhookAt: new Date()
    };

    switch(statusCode){
      case '81':
      case '82':
        order.status = OrderStatus.SHIPPED;
        break;
      case '0':
        order.status = OrderStatus.DELIVERED;
        break;
    }

    await this.orderRepository.save(order);
    this.logger.log(`Commande ${order.id} mise à jour via webhook (nouveau Statut: ${statusCode})`);
  }
}
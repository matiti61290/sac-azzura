import { Injectable, OnModuleInit, Logger, HttpStatus, HttpException, InternalServerErrorException } from '@nestjs/common';
import * as soap from 'soap';
import { createHash } from 'crypto';
import { FindRelayPointDto } from 'src/shared/dtos/mondial_relai/findRelayPoint.dto';
import { XMLParser } from 'fast-xml-parser';
import { CreateLabelDto } from 'src/shared/dtos/mondial_relai/createLabelDto.dto';

@Injectable()
export class MondialRelayService implements OnModuleInit {
  private readonly logger = new Logger(MondialRelayService.name);
  private client: any;

  //API V1 SOAP
  private readonly apiV1Brand = process.env.MONDIAL_RELAY_API_V1_BRAND
  private readonly apiV1PrivateKey = process.env.MONDIAL_RELAY_API_V1_PRIVATE_KEY
  private readonly apiV1Url = process.env.MONDIAL_RELAY_API_V1_URL

  //API 2 REST
  private readonly apiV2Brand = process.env.MONDIAL_RELAY_API_V2_BRAND
  private readonly apiV2Mail = process.env.MONDIAL_RELAY_API_V2_MAIL
  private readonly apiV2Password = process.env.MONDIAL_RELAY_API_V2_PASSWORD
  private readonly apiV2Url = process.env.MONDIAL_RELAY_API_V2_URL

  async onModuleInit() {
    if(!this.apiV1Url){
      throw new InternalServerErrorException('probleme url api')
    }
    try {
      this.client = await soap.createClientAsync(this.apiV1Url, {
        forceSoap12Headers: true,
        endpoint: 'https://api.mondialrelay.com/Web_Services.asmx',
      });
      this.logger.log('Mondial Relay : Client SOAP (V1) prêt');
    } catch (error) {
      this.logger.error(`Erreur WSDL : ${error.message}`);
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

    const security = createHash('md5')
      .update(securityString)
      .digest('hex')
      .toUpperCase();

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
      if (error.response && error.response.data) {
          this.logger.error("Réponse d'erreur du serveur reçue.");
      }
      return { success: false, message: error.message };
    }
  }

  async createLabel(createLabelDto: CreateLabelDto): Promise<any> {

    if(!this.apiV2Url){
      throw new InternalServerErrorException('Probleme d\'url de \'api')
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
        this.logger.error(`Erreur HTTP: ${response.status} - ${responseText}`);
        throw new HttpException(
          "Erreur lors de la communication avec l'API Mondial Relay",
          response.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      this.logger.debug("Réponse brute de Mondial Relay:", responseText);
      
      const parser = new XMLParser({ ignoreAttributes: false });
      const parsedJson = parser.parse(responseText);

      const statusNode = parsedJson?.ShipmentCreationResponse?.StatusList?.Status;
      const statusCode = statusNode ? (statusNode['@_Code'] || statusNode.Code) : null;

      if (statusCode === "0") {
          const shipmentNode = parsedJson.ShipmentCreationResponse.ShipmentsList.Shipment;
          const pdfUrl = shipmentNode.LabelList.Label.Output;
          const trackingNumber = shipmentNode['@_ShipmentNumber'] || shipmentNode.ShipmentNumber;

          this.logger.log(`Étiquette générée avec succès ! Tracking: ${trackingNumber}`);
          
          return {
              success: true,
              trackingNumber: trackingNumber,
              pdfUrl: pdfUrl
          };
      } else {
          this.logger.warn(`Erreur API Mondial Relay détaillée : ${JSON.stringify(statusNode)}`);
          return {
              success: false,
              message: "Erreur lors de la création de l'étiquette (Erreur Métier)",
              details: statusNode
          };
      }

    } catch (error) {
      this.logger.error("Erreur d'exécution de la création d'étiquette", error);
      throw new HttpException(
        error.message || "Erreur interne",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
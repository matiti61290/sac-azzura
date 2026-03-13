import { Injectable, OnModuleInit, Logger, HttpStatus, HttpException } from '@nestjs/common';
import * as soap from 'soap';
import { createHash } from 'crypto';
import { FindRelayPointDto } from 'src/shared/dtos/mondial_relai/findRelayPoint.dto';
import { XMLParser } from 'fast-xml-parser'; // <-- Ajout de l'import

@Injectable()
export class MondialRelayService implements OnModuleInit {
  private readonly logger = new Logger(MondialRelayService.name);
  private client: any;

  // --- CONFIGURATION API V1 (SOAP - Recherche de points) ---
  private readonly enseigneV1 = 'TTMRSDBX';
  private readonly privateKeyV1 = '9ytnxVCC';
  private readonly wsdlUrl = 'https://api.mondialrelay.com/Web_Services.asmx?WSDL';

  // --- CONFIGURATION API V2 (REST - Étiquettes) ---
  // Utilisation des nouveaux identifiants reçus par mail
  private readonly apiUrlV2 = 'https://connect-api-sandbox.mondialrelay.com/api/shipment';
  private readonly apiBrandV2 = 'TTMRSDBX'; // Identification de marque
  private readonly apiLoginV2 = 'TTMRSDBX@business-api.mondialrelay.com'; // Connexion API
  private readonly apiPasswordV2 = '_iVfPcMexuOcOmF:6sq0'; // Mot de passe API

  async onModuleInit() {
    try {
      this.client = await soap.createClientAsync(this.wsdlUrl, {
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
      Enseigne: this.enseigneV1,
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

    // Concaténation stricte de TOUS les paramètres de soapArgs dans le bon ordre
    const securityString =
      this.enseigneV1 +
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
      this.privateKeyV1;

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

  async createLabel(): Promise<any> {
    const xmlPayload = `<?xml version="1.0" encoding="utf-8"?>
<ShipmentCreationRequest xmlns="http://www.example.org/Request">
    <Context>
        <Login>${this.apiLoginV2}</Login>
        <Password>${this.apiPasswordV2}</Password>
        <CustomerId>${this.apiBrandV2}</CustomerId>
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
            <CustomerNo>${this.apiBrandV2}</CustomerNo>
            <ParcelCount>1</ParcelCount>
            <DeliveryMode Mode="24R" Location="FR-39807" />
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
      const response = await fetch(this.apiUrlV2, {
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
      
      // --- NOUVEAU BLOC INTÉGRÉ ICI ---
      // L'option ignoreAttributes: false est requise pour lire l'attribut `Code="0"`
      const parser = new XMLParser({ ignoreAttributes: false });
      const parsedJson = parser.parse(responseText);

      // On navigue dans l'objet JSON généré par fast-xml-parser
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
      // --------------------------------

    } catch (error) {
      this.logger.error("Erreur d'exécution de la création d'étiquette", error);
      throw new HttpException(
        error.message || "Erreur interne",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
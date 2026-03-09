import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as soap from 'soap';
import { createHash } from 'crypto';

@Injectable()
export class MondialRelayService implements OnModuleInit {
  private readonly logger = new Logger(MondialRelayService.name);
  private client: any;

  private readonly enseigne = 'TTMRSDBX';
  private readonly privateKey = '9ytnxVCC';
  
  private readonly wsdlUrl = 'https://api.mondialrelay.com/Web_Services.asmx?WSDL';

  async onModuleInit() {
    try {
      this.client = await soap.createClientAsync(this.wsdlUrl, {
        forceSoap12Headers: true,
        endpoint: 'https://api.mondialrelay.com/Web_Services.asmx',
      });
      this.logger.log('Client SOAP Mondial Relay prêt (Mode POST forcé)');
    } catch (error) {
      this.logger.error(`Erreur WSDL : ${error.message}`);
    }
  }

  async rechercherPointsRelais(cp: string, pays: string = 'FR') {
    if (!this.client) return { success: false, message: 'Client non prêt' };

    const soapArgs = {
      Enseigne: this.enseigne,
      Pays: pays.toUpperCase(),
      NumPointRelais: '',
      Ville: '',
      CP: cp,
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

    const security = createHash('md5')
      .update(
        this.enseigne + soapArgs.Pays + soapArgs.NumPointRelais + soapArgs.CP +
        soapArgs.Latitude + soapArgs.Longitude + soapArgs.Taille + soapArgs.Poids +
        soapArgs.Action + soapArgs.DelaiEnvoi + soapArgs.RayonRecherche + 
        soapArgs.NombreResultats + this.privateKey
      )
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
}
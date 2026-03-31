import { HttpException, HttpStatus, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';

@Injectable()
export class ColissimoService {
  constructor() {}

  private readonly logger = new Logger(ColissimoService.name)

  private readonly apiUrl = process.env.COLISSIMO_API_URL

  private getHeaders(): HeadersInit {
    const apiKey = process.env.COLISSIMO_API_KEY

    if(!apiKey){
      throw new InternalServerErrorException('la cle api n\'existe pas')
    }
    return {
      'Content-Type': 'application/json',
      'apiKey': apiKey,
      'Accept': 'multipart/related'
    }
  }

  public async getLabel(parcelNumber: string) {
    const url = `${this.apiUrl}/getLabel`

    const payload = {
      parcelNumber: parcelNumber
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload)
      })

      if(!response.ok){
        const errorText = await response.text()
        this.logger.error(`erreur HTTP ${response.status} pour le colis ${parcelNumber}`)
        throw new InternalServerErrorException(`Erreur API colissimo: ${response.text}`)
      }

      const arrayBuffer = await response.arrayBuffer()
      return Buffer.from(arrayBuffer)
    } catch (error) {
      this.logger.error(`Erreur getLabel pour le colis ${parcelNumber}`, error)
      HttpStatus.INTERNAL_SERVER_ERROR
    }
  }
  
  public async generateLabel() {
    const url = `${this.apiUrl}/generateLabel`

    const payload = {
      outputFormat: {
        outputPrintingType: 'PDF_10x15_300dpi',
        returnType: 'WEB',
      },
      letter: {
        service: {
          productCode: 'DOM',
          depositDate: '2026-04-05', // À dynamiser
        },
        parcel: {
          weight: 1.5,
          nonMachinable: false,
        },
        sender: {
          address: {
            companyName: 'Ma Boutique',
            line2: '12 Rue de la Paix',
            countryCode: 'FR',
            city: 'Paris',
            zipCode: '75000',
          },
        },
        addressee: {
          address: {
            lastName: 'Dupont',
            firstName: 'Jean',
            line2: '1 Avenue des Champs-Elysées',
            countryCode: 'FR',
            city: 'Paris',
            zipCode: '75008',
          },
        },
      },
    };

    try{
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload)     
      })

      if(!response.ok){
        const errorText = await response.text()
      this.logger.error(`Erreur HTTP ${response.status}: ${errorText}`)
      throw new Error(`Erreur API Colissimo: ${response.statusText}`)
      }

      const arrayBuffer = await response.arrayBuffer()
      return Buffer.from(arrayBuffer)
    } catch (error) {
      this.logger.error('Erreur lors de la generation generateLabel', error)
      throw new InternalServerErrorException('Erreur lors de la creation de l\'etiquette Colissimo')
    }
  }
  
  public async checkGenerationLabel() {}
}

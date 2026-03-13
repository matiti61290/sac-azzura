import { Controller, Get, Query, BadRequestException, Post, Body } from '@nestjs/common';
import { MondialRelayService } from './service/mondial-relai.service';
import { FindRelayPointDto } from 'src/shared/dtos/mondial_relai/findRelayPoint.dto';

@Controller('shipping')
export class ShippingController {
  constructor(private readonly mondialRelayService: MondialRelayService) {}

  @Get('mondial-relai/points-relais')
  async getPointsRelais(
    @Body() findRelayPointDto: FindRelayPointDto
  ) {
    const result = await this.mondialRelayService.rechercherPointsRelais(findRelayPointDto);
    return result
  }

  @Post('create-label')
  async generateLabel() {
    // Appel du service qui exécute le fetch vers API2
    const resultXml = await this.mondialRelayService.createLabel();
    
    // Vous pouvez retourner directement le XML, ou idéalement le JSON converti
    return resultXml; 
  }
}
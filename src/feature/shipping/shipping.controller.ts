import { Controller, Get, Param, Post, Body, ParseIntPipe } from '@nestjs/common';
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

  @Post('create-label/:relayId')
  async generateLabel(
    @Param('relayId') relayId: string
  ) {
    const resultXml = await this.mondialRelayService.createLabel(relayId);
    
    return resultXml; 
  }
}
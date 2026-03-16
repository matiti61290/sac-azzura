import { Controller, Get, Param, Post, Body, ParseIntPipe } from '@nestjs/common';
import { MondialRelayService } from './service/mondial-relai.service';
import { FindRelayPointDto } from 'src/shared/dtos/mondial_relai/findRelayPoint.dto';
import { CreateLabelDto } from 'src/shared/dtos/mondial_relai/createLabelDto.dto';

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
  async generateLabel(
    @Body() createLabelDto: CreateLabelDto
  ) {
    const resultXml = await this.mondialRelayService.createLabel(createLabelDto);
    
    return resultXml; 
  }
}
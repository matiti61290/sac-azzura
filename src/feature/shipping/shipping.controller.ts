import { Controller, Get, Param, Post, Body, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { MondialRelayService } from './service/mondial-relai.service';
import { ColissimoService } from './service/colissimo.service';
import { FindRelayPointDto } from 'src/shared/dtos/mondial_relai/findRelayPoint.dto';
import { CreateLabelDto } from 'src/shared/dtos/mondial_relai/createLabelDto.dto';

@Controller('shipping')
export class ShippingController {
  constructor(
    private readonly mondialRelayService: MondialRelayService,
    private readonly colissimoService: ColissimoService,
  ) {}

  @Get('mondial-relai/points-relais')
  async getPointsRelais(
    @Body() findRelayPointDto: FindRelayPointDto
  ) {
    const result = await this.mondialRelayService.rechercherPointsRelais(findRelayPointDto);
    return result
  }

  @Post('mondial-relai/create-label')
  async generateLabel(
    @Body() createLabelDto: CreateLabelDto
  ) {
    const resultXml = await this.mondialRelayService.createLabel(createLabelDto);
    
    return resultXml; 
  }

  @Get('mondial-relai/tracing-package/:orderId')
  async tracingPackage(
    @Param('orderId', ParseIntPipe) orderId: number
  ){
    return this.mondialRelayService.tracingPackage(orderId)
  }

  @Post('mondial-relay/webhook')
  @HttpCode(HttpStatus.OK)
  async handleMondialRelayWebhook(
    @Body() payload: any
  ) {
    
  }
} 
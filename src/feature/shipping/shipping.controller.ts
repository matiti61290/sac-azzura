import { Controller, Get, Param, Post, Body, ParseIntPipe, HttpCode, HttpStatus, Query, UnauthorizedException } from '@nestjs/common';
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

  //Mondial Relay
  @Get('mondial-relai/points-relais')
  async getPointsRelais(
    @Body() findRelayPointDto: FindRelayPointDto
  ) {
    return await this.mondialRelayService.rechercherPointsRelais(findRelayPointDto);
  }

  @Post('mondial-relai/create-label')
  async generateMrLabel(
    @Body() createLabelDto: CreateLabelDto
  ) {
    return await this.mondialRelayService.createLabel(createLabelDto);
  }

  @Get('mondial-relai/tracing-package/:orderId')
  async tracingPackage(
    @Param('orderId', ParseIntPipe) orderId: number
  ){
    return this.mondialRelayService.tracingPackage(orderId);
  }

  @Post('mondial-relay/webhook')
  @HttpCode(HttpStatus.OK)
  async handleMondialRelayWebhook(
    @Query('token') token: string,
    @Body() payload: any
  ) {
    await this.mondialRelayService.handleWebhook(payload, token);
  }

  //Colissimo
  @Post('colissimo/generate-label/:orderId')
  async generateColissimoLabel(
    @Param('orderId', ParseIntPipe) orderId: number
  ){
    return this.colissimoService.generateLabel(orderId);
  }
}
import { Controller, Get, Query, BadRequestException, Post } from '@nestjs/common';
import { MondialRelayService } from './service/mondial-relai.service';

@Controller('shipping')
export class ShippingController {
  constructor(private readonly mondialRelayService: MondialRelayService) {}

  @Get('points-relais')
  async getPointsRelais(
    @Query('cp') cp: string,
    @Query('pays') pays: string = 'FR'
  ) {
    if (!cp) {
      throw new BadRequestException('Le code postal (cp) est obligatoire.');
    }

    const result = await this.mondialRelayService.rechercherPointsRelais(cp, pays);
    return result
  }
}
import { Controller, Post, Body, Get, Query, Res } from '@nestjs/common';
import { NewsletterService } from './newsletter.service';
import { SubscribeDto } from '../../shared/dtos/subscriber/subscriber.dto';

@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Post('subscribe')
  async subscribe(@Body() body: SubscribeDto) {
    await this.newsletterService.subscribe(body.email);
    return { message: 'Un email de confirmation vous a été envoyé.' };
  }

  @Get('verify')
  async verify(@Query('token') token: string) {
    const message = await this.newsletterService.verify(token);
    return { message };
  }
}
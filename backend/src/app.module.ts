import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './feature/auth/auth.module';
import { dataSourceOptions } from './database/ormconfig';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './feature/user/user.module';
import { ProductModule } from './feature/product/product.module';
import { CategoryModule } from './feature/category/category.module';
import { SubcategoryModule } from './feature/subcategory/subcategory.module';
import { ColorModule } from './feature/color/color.module';
import { MaterialModule } from './feature/material/material.module';
import { AwsS3Service } from './feature/aws-s3/aws-s3.service';
import { StockModule } from './feature/stock/stock.module';
import { PaymentModule } from './feature/payment/payment.module';
import { OrderModule } from './feature/order/order.module';
import { AddressModule } from './feature/address/address.module';
import { PromotionModule } from './feature/promotion/promotion.module';
import { CsrfModule } from './feature/csrf/csrf.module';
import { ShippingModule } from './feature/shipping/shipping.module';
import { NewsletterModule } from './feature/newsletter/newsletter.module';
import { CsrfMiddleware } from './feature/csrf/csrf.middleware';

@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions),
    ConfigModule.forRoot({
      isGlobal: true
    }), 
    AuthModule,
    UserModule,
    ProductModule,
    CategoryModule,
    SubcategoryModule,
    ColorModule,
    MaterialModule,
    StockModule,
    PaymentModule,
    OrderModule,
    AddressModule,
    PromotionModule,
    CsrfModule,
    ShippingModule,
    NewsletterModule
  ],
  controllers: [AppController],
  providers: [AppService, AwsS3Service],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CsrfMiddleware)
    .exclude(
      {path: 'newsletter', method: RequestMethod.POST},
      {path: 'products/', method: RequestMethod.GET},
      {path: 'auth/login', method: RequestMethod.POST},
      {path: 'payment/webhook', method: RequestMethod.POST}
    ).forRoutes('*')
  }
}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './feature/auth/auth.module';
import { AuthController } from './feature/auth/auth.controller';
import { AuthService } from './feature/auth/auth.service';
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
import { AdminGuard } from './feature/auth/guards/admin.guard';
import { StockModule } from './feature/stock/stock.module';
import { PaymentModule } from './feature/payment/payment.module';
import { OrderModule } from './feature/order/order.module';
import { AddressModule } from './feature/address/address.module';
import { PromotionModule } from './feature/promotion/promotion.module';

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
    PromotionModule
  ],
  controllers: [AppController],
  providers: [AppService, AwsS3Service],
})
export class AppModule {}

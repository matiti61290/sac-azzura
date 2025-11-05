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
    SubcategoryModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

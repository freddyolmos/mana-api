import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './modules/catalog/categories/categories.module';
import { ProductsModule } from './modules/catalog/products/products.module';
import { ModifiersModule } from './modules/catalog/modifiers/modifiers.module';
import { OrdersModule } from './modules/orders/orders.module';
import { KitchenModule } from './modules/kitchen/kitchen.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    UsersModule,
    PrismaModule,
    AuthModule,
    CategoriesModule,
    ProductsModule,
    ModifiersModule,
    OrdersModule,
    KitchenModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

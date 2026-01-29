import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { KitchenModule } from '../kitchen/kitchen.module';

@Module({
  imports: [PrismaModule, KitchenModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}

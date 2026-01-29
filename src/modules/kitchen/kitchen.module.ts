import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { KitchenController } from './kitchen.controller';
import { KitchenService } from './kitchen.service';
import { KitchenGateway } from './kitchen.gateway';

@Module({
  imports: [PrismaModule],
  controllers: [KitchenController],
  providers: [KitchenService, KitchenGateway],
  exports: [KitchenGateway, KitchenService],
})
export class KitchenModule {}

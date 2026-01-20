import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ModifierGroupsController } from './modifier-groups.controller';
import { ModifierGroupsService } from './modifier-groups.service';

@Module({
  imports: [PrismaModule],
  controllers: [ModifierGroupsController],
  providers: [ModifierGroupsService],
})
export class ModifiersModule {}

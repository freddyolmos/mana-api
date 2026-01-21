import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ModifierGroupsController } from './modifier-groups.controller';
import { ModifierGroupsService } from './modifier-groups.service';
import { ModifierOptionsController } from './modifier-options.controller';
import { ModifierOptionsService } from './modifier-options.service';
import { ProductModifierGroupsController } from './product-modifier-groups.controller';
import { ProductModifierGroupsService } from './product-modifier-groups.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    ModifierGroupsController,
    ModifierOptionsController,
    ProductModifierGroupsController,
  ],
  providers: [
    ModifierGroupsService,
    ModifierOptionsService,
    ProductModifierGroupsService,
  ],
})
export class ModifiersModule {}

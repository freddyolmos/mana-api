-- Allow deleting modifier groups/options referenced only by finalized orders.
-- Keep order-item modifier history by nulling FK refs on delete.
ALTER TABLE "order_item_modifiers" ALTER COLUMN "groupId" DROP NOT NULL;
ALTER TABLE "order_item_modifiers" ALTER COLUMN "optionId" DROP NOT NULL;

ALTER TABLE "order_item_modifiers" DROP CONSTRAINT "order_item_modifiers_groupId_fkey";
ALTER TABLE "order_item_modifiers" DROP CONSTRAINT "order_item_modifiers_optionId_fkey";

ALTER TABLE "order_item_modifiers"
ADD CONSTRAINT "order_item_modifiers_groupId_fkey"
FOREIGN KEY ("groupId") REFERENCES "modifier_groups"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "order_item_modifiers"
ADD CONSTRAINT "order_item_modifiers_optionId_fkey"
FOREIGN KEY ("optionId") REFERENCES "modifier_options"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

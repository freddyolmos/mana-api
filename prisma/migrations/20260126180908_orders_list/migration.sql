-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('DINE_IN', 'TAKEOUT', 'DELIVERY');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('OPEN', 'SENT_TO_KITCHEN', 'CLOSED', 'CANCELED');

-- CreateEnum
CREATE TYPE "OrderItemStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'READY', 'CANCELED');

-- CreateTable
CREATE TABLE "orders" (
    "id" SERIAL NOT NULL,
    "type" "OrderType" NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'OPEN',
    "notes" TEXT,
    "subtotal" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "total" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "createdById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "qty" INTEGER NOT NULL,
    "status" "OrderItemStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "modifiersTotal" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "lineTotal" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_item_modifiers" (
    "id" SERIAL NOT NULL,
    "orderItemId" INTEGER NOT NULL,
    "groupId" INTEGER NOT NULL,
    "optionId" INTEGER NOT NULL,
    "priceDeltaSnapshot" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "order_item_modifiers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE INDEX "orders_type_idx" ON "orders"("type");

-- CreateIndex
CREATE INDEX "order_items_orderId_idx" ON "order_items"("orderId");

-- CreateIndex
CREATE INDEX "order_items_productId_idx" ON "order_items"("productId");

-- CreateIndex
CREATE INDEX "order_item_modifiers_orderItemId_idx" ON "order_item_modifiers"("orderItemId");

-- CreateIndex
CREATE INDEX "order_item_modifiers_groupId_idx" ON "order_item_modifiers"("groupId");

-- CreateIndex
CREATE INDEX "order_item_modifiers_optionId_idx" ON "order_item_modifiers"("optionId");

-- CreateIndex
CREATE UNIQUE INDEX "order_item_modifiers_orderItemId_optionId_key" ON "order_item_modifiers"("orderItemId", "optionId");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item_modifiers" ADD CONSTRAINT "order_item_modifiers_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "order_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item_modifiers" ADD CONSTRAINT "order_item_modifiers_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "modifier_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item_modifiers" ADD CONSTRAINT "order_item_modifiers_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "modifier_options"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

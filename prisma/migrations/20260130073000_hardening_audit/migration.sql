-- CreateEnum
CREATE TYPE "OrderEventType" AS ENUM (
  'ORDER_SENT_TO_KITCHEN',
  'ITEM_STATUS_CHANGED',
  'ORDER_READY',
  'TICKET_CREATED',
  'PAYMENT_ADDED',
  'TICKET_CLOSED',
  'TABLE_ATTACHED',
  'TABLE_RELEASED'
);

-- AlterTable
ALTER TABLE "tickets" ADD COLUMN "createdById" INTEGER;

-- AlterTable
ALTER TABLE "payments" ADD COLUMN "createdById" INTEGER;

-- CreateTable
CREATE TABLE "order_events" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "type" "OrderEventType" NOT NULL,
    "message" TEXT,
    "payload" JSONB,
    "createdById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tickets_createdById_idx" ON "tickets"("createdById");

-- CreateIndex
CREATE INDEX "payments_createdById_idx" ON "payments"("createdById");

-- CreateIndex
CREATE INDEX "order_events_orderId_idx" ON "order_events"("orderId");

-- CreateIndex
CREATE INDEX "order_events_type_idx" ON "order_events"("type");

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_events" ADD CONSTRAINT "order_events_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_events" ADD CONSTRAINT "order_events_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

/*
  Warnings:

  - A unique constraint covering the columns `[cartId,variantId]` on the table `cart_items` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "cart_items_cartId_productId_key";

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "variantId" INTEGER;

-- AlterTable
ALTER TABLE "cart_items" ADD COLUMN     "variantId" INTEGER;

-- CreateIndex
CREATE INDEX "OrderItem_productId_idx" ON "OrderItem"("productId");

-- CreateIndex
CREATE INDEX "OrderItem_variantId_idx" ON "OrderItem"("variantId");

-- CreateIndex
CREATE INDEX "cart_items_productId_idx" ON "cart_items"("productId");

-- CreateIndex
CREATE INDEX "cart_items_variantId_idx" ON "cart_items"("variantId");

-- CreateIndex
CREATE UNIQUE INDEX "cart_items_cartId_variantId_key" ON "cart_items"("cartId", "variantId");

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

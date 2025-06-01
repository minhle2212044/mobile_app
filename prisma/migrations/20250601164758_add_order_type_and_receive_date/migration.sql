/*
  Warnings:

  - Added the required column `receiveDate` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('MATERIAL', 'REWARD');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "receiveDate" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
ADD COLUMN     "type" "OrderType" NOT NULL DEFAULT 'MATERIAL';

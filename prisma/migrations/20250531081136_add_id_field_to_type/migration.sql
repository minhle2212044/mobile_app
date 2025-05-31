/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `Type` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Type" ADD COLUMN     "id" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Type_id_key" ON "Type"("id");

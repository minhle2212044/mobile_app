/*
  Warnings:

  - You are about to drop the `vatlieu` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `vatlieu`;

-- CreateTable
CREATE TABLE `Material` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `recyclingCode` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `points` INTEGER NOT NULL,
    `recyclingInstructions` VARCHAR(191) NULL,
    `isHazardous` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

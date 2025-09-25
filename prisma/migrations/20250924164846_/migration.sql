/*
  Warnings:

  - Added the required column `description` to the `VideoInformation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `VideoInformation` ADD COLUMN `description` VARCHAR(191) NOT NULL;

/*
  Warnings:

  - You are about to drop the column `url` on the `News` table. All the data in the column will be lost.
  - Added the required column `thumbnail` to the `News` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `News` DROP COLUMN `url`,
    ADD COLUMN `thumbnail` VARCHAR(191) NOT NULL;

/*
  Warnings:

  - Added the required column `user_id` to the `answer_session` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `answer_session` ADD COLUMN `user_id` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `answer_session` ADD CONSTRAINT `answer_session_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

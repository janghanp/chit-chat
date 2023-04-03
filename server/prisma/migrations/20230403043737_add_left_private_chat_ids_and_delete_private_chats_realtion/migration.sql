/*
  Warnings:

  - You are about to drop the `_PrivateChats` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_PrivateChats" DROP CONSTRAINT "_PrivateChats_A_fkey";

-- DropForeignKey
ALTER TABLE "_PrivateChats" DROP CONSTRAINT "_PrivateChats_B_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "leftPrivateChatIds" TEXT[];

-- DropTable
DROP TABLE "_PrivateChats";

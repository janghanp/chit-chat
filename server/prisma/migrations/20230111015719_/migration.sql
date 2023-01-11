/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Chat` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `Chat` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "name" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Chat_name_key" ON "Chat"("name");

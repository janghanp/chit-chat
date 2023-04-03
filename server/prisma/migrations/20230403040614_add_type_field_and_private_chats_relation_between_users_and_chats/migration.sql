-- CreateEnum
CREATE TYPE "Type" AS ENUM ('GROUP', 'PRIVATE');

-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "type" "Type" NOT NULL DEFAULT 'GROUP';

-- CreateTable
CREATE TABLE "_PrivateChats" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_PrivateChats_AB_unique" ON "_PrivateChats"("A", "B");

-- CreateIndex
CREATE INDEX "_PrivateChats_B_index" ON "_PrivateChats"("B");

-- AddForeignKey
ALTER TABLE "_PrivateChats" ADD CONSTRAINT "_PrivateChats_A_fkey" FOREIGN KEY ("A") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PrivateChats" ADD CONSTRAINT "_PrivateChats_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

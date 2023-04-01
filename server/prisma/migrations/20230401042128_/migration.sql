-- DropIndex
DROP INDEX "Chat_name_key";

-- AlterTable
ALTER TABLE "Chat" ALTER COLUMN "name" DROP NOT NULL;

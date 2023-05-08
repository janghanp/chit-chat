-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "text" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "link" TEXT;

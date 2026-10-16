-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailConnected" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "emailHost" TEXT DEFAULT 'smtp.gmail.com',
ADD COLUMN     "emailPass" TEXT,
ADD COLUMN     "emailPort" INTEGER DEFAULT 587,
ADD COLUMN     "emailUser" TEXT;

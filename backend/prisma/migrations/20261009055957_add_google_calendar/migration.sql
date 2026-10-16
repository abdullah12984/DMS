-- AlterTable
ALTER TABLE "Meeting" ADD COLUMN     "googleEventId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "googleCalendarConnected" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "googleCalendarEmail" TEXT,
ADD COLUMN     "googleCalendarRefreshToken" TEXT;

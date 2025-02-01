-- CreateEnum
CREATE TYPE "GovIdType" AS ENUM ('PASSPORT', 'DRIVERS_LICENSE', 'NATIONAL_ID', 'OTHER');

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "attendeeDob" TIMESTAMP(3),
ADD COLUMN     "attendeeGovId" TEXT,
ADD COLUMN     "attendeeGovIdType" "GovIdType",
ADD COLUMN     "attendeeName" TEXT;

-- AlterEnum
ALTER TYPE "PropertyStatus" ADD VALUE 'PLANNING';

-- AlterTable
ALTER TABLE "Property" ADD COLUMN "progressPercent" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Property" ADD COLUMN "startDate" TIMESTAMP(3);
ALTER TABLE "Property" ADD COLUMN "targetCompletionDate" TIMESTAMP(3);
ALTER TABLE "Property" ADD COLUMN "completedAt" TIMESTAMP(3);

-- Completed projects default to 100% when previously unset
UPDATE "Property"
SET "progressPercent" = 100
WHERE "status" = 'COMPLETED' AND "progressPercent" = 0;

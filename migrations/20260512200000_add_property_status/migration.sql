-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED');

-- AlterTable
ALTER TABLE "Property" ADD COLUMN "status" "PropertyStatus" NOT NULL DEFAULT 'IN_PROGRESS';

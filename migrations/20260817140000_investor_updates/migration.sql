-- CreateEnum
CREATE TYPE "InvestorUpdateType" AS ENUM ('PROPERTY_STATUS', 'PROPERTY_DOCUMENTS');

-- AlterTable
ALTER TABLE "Property" ADD COLUMN "documentsNotifiedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "investor_updates" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "propertyId" TEXT NOT NULL,
    "type" "InvestorUpdateType" NOT NULL,
    "payload" JSONB NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "investor_updates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "investor_updates_userId_readAt_createdAt_idx" ON "investor_updates"("userId", "readAt", "createdAt");

-- AddForeignKey
ALTER TABLE "investor_updates" ADD CONSTRAINT "investor_updates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investor_updates" ADD CONSTRAINT "investor_updates_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

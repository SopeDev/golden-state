-- Pago 6: FundingContribution ledger + DepositRequest queue (replaces Investment)

CREATE TYPE "FundingContributionSource" AS ENUM ('INVESTOR', 'MANUAL');
CREATE TYPE "FundingContributionStatus" AS ENUM ('ACTIVE', 'CANCELLED');
CREATE TYPE "DepositRequestStatus" AS ENUM ('PENDING', 'CONFIRMED', 'REJECTED');

CREATE TABLE "deposit_requests" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "propertyId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "reference" TEXT,
    "depositedAt" TIMESTAMP(3),
    "status" "DepositRequestStatus" NOT NULL DEFAULT 'PENDING',
    "adminNote" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" INTEGER,
    "createdByAdminId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deposit_requests_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Investment" RENAME TO "funding_contributions";

ALTER TABLE "funding_contributions" RENAME CONSTRAINT "Investment_pkey" TO "funding_contributions_pkey";
ALTER TABLE "funding_contributions" RENAME CONSTRAINT "Investment_userId_fkey" TO "funding_contributions_userId_fkey";
ALTER TABLE "funding_contributions" RENAME CONSTRAINT "Investment_propertyId_fkey" TO "funding_contributions_propertyId_fkey";

ALTER TABLE "funding_contributions"
  ADD COLUMN "source" "FundingContributionSource" NOT NULL DEFAULT 'INVESTOR',
  ADD COLUMN "status" "FundingContributionStatus" NOT NULL DEFAULT 'ACTIVE',
  ADD COLUMN "label" TEXT,
  ADD COLUMN "note" TEXT,
  ADD COLUMN "createdByAdminId" INTEGER,
  ADD COLUMN "depositRequestId" TEXT,
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "cancelledAt" TIMESTAMP(3);

ALTER TABLE "funding_contributions" ALTER COLUMN "userId" DROP NOT NULL;

CREATE UNIQUE INDEX "funding_contributions_depositRequestId_key" ON "funding_contributions"("depositRequestId");
CREATE INDEX "funding_contributions_propertyId_status_idx" ON "funding_contributions"("propertyId", "status");
CREATE INDEX "funding_contributions_userId_status_idx" ON "funding_contributions"("userId", "status");

CREATE INDEX "deposit_requests_status_createdAt_idx" ON "deposit_requests"("status", "createdAt");
CREATE INDEX "deposit_requests_propertyId_status_idx" ON "deposit_requests"("propertyId", "status");
CREATE INDEX "deposit_requests_userId_status_idx" ON "deposit_requests"("userId", "status");

ALTER TABLE "deposit_requests" ADD CONSTRAINT "deposit_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "deposit_requests" ADD CONSTRAINT "deposit_requests_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "deposit_requests" ADD CONSTRAINT "deposit_requests_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "deposit_requests" ADD CONSTRAINT "deposit_requests_createdByAdminId_fkey" FOREIGN KEY ("createdByAdminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "funding_contributions" ADD CONSTRAINT "funding_contributions_createdByAdminId_fkey" FOREIGN KEY ("createdByAdminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "funding_contributions" ADD CONSTRAINT "funding_contributions_depositRequestId_fkey" FOREIGN KEY ("depositRequestId") REFERENCES "deposit_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

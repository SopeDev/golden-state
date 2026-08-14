-- CreateEnum
CREATE TYPE "ReturnDistributionStatus" AS ENUM ('ACTIVE', 'VOIDED');

-- CreateEnum
CREATE TYPE "WalletRequestStatus" AS ENUM ('PENDING', 'CONFIRMED', 'REJECTED');

-- AlterTable
ALTER TABLE "funding_contributions" ADD COLUMN "reinvestmentRequestId" TEXT;

-- CreateTable
CREATE TABLE "return_distributions" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "propertyId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "concept" TEXT,
    "note" TEXT,
    "distributedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "ReturnDistributionStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdByAdminId" INTEGER,
    "voidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "return_distributions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cash_out_requests" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "WalletRequestStatus" NOT NULL DEFAULT 'PENDING',
    "adminNote" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cash_out_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reinvest_requests" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "destinationPropertyId" TEXT NOT NULL,
    "status" "WalletRequestStatus" NOT NULL DEFAULT 'PENDING',
    "adminNote" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reinvest_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "return_distributions_userId_status_idx" ON "return_distributions"("userId", "status");

-- CreateIndex
CREATE INDEX "return_distributions_propertyId_createdAt_idx" ON "return_distributions"("propertyId", "createdAt");

-- CreateIndex
CREATE INDEX "cash_out_requests_status_createdAt_idx" ON "cash_out_requests"("status", "createdAt");

-- CreateIndex
CREATE INDEX "cash_out_requests_userId_status_idx" ON "cash_out_requests"("userId", "status");

-- CreateIndex
CREATE INDEX "reinvest_requests_status_createdAt_idx" ON "reinvest_requests"("status", "createdAt");

-- CreateIndex
CREATE INDEX "reinvest_requests_userId_status_idx" ON "reinvest_requests"("userId", "status");

-- CreateIndex
CREATE INDEX "reinvest_requests_destinationPropertyId_status_idx" ON "reinvest_requests"("destinationPropertyId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "funding_contributions_reinvestmentRequestId_key" ON "funding_contributions"("reinvestmentRequestId");

-- AddForeignKey
ALTER TABLE "funding_contributions" ADD CONSTRAINT "funding_contributions_reinvestmentRequestId_fkey" FOREIGN KEY ("reinvestmentRequestId") REFERENCES "reinvest_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_distributions" ADD CONSTRAINT "return_distributions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_distributions" ADD CONSTRAINT "return_distributions_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_distributions" ADD CONSTRAINT "return_distributions_createdByAdminId_fkey" FOREIGN KEY ("createdByAdminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_out_requests" ADD CONSTRAINT "cash_out_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_out_requests" ADD CONSTRAINT "cash_out_requests_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reinvest_requests" ADD CONSTRAINT "reinvest_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reinvest_requests" ADD CONSTRAINT "reinvest_requests_destinationPropertyId_fkey" FOREIGN KEY ("destinationPropertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reinvest_requests" ADD CONSTRAINT "reinvest_requests_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

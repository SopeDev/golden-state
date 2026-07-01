-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('PENDING_EMAIL', 'PENDING_ADMIN', 'ACTIVE', 'REJECTED');

-- CreateEnum
CREATE TYPE "AccreditedStatus" AS ENUM ('NOT_STARTED', 'PENDING_REVIEW', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "InvestorDocumentKind" AS ENUM ('ACCREDITATION', 'INCOME_PROOF', 'NET_WORTH', 'GOVERNMENT_ID', 'OTHER');

-- CreateEnum
CREATE TYPE "InvestmentIntentStatus" AS ENUM ('STARTED', 'ACCREDITATION_PENDING', 'READY', 'CANCELLED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "accountStatus" "AccountStatus" NOT NULL DEFAULT 'PENDING_EMAIL',
ADD COLUMN "emailVerifiedAt" TIMESTAMP(3),
ADD COLUMN "emailVerificationToken" TEXT,
ADD COLUMN "emailVerificationExpires" TIMESTAMP(3),
ADD COLUMN "adminApprovedAt" TIMESTAMP(3),
ADD COLUMN "adminApprovedById" INTEGER,
ADD COLUMN "profile" JSONB,
ADD COLUMN "accreditedStatus" "AccreditedStatus" NOT NULL DEFAULT 'NOT_STARTED',
ADD COLUMN "accreditedSubmittedAt" TIMESTAMP(3),
ADD COLUMN "accreditedReviewedAt" TIMESTAMP(3),
ADD COLUMN "accreditedReviewNote" TEXT,
ADD COLUMN "passwordResetToken" TEXT,
ADD COLUMN "passwordResetExpires" TIMESTAMP(3),
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Existing users: treat as fully active investors/admins
UPDATE "User" SET "accountStatus" = 'ACTIVE', "emailVerifiedAt" = COALESCE("emailVerifiedAt", NOW()) WHERE "type" = 'ADMIN';
UPDATE "User" SET "accountStatus" = 'ACTIVE', "emailVerifiedAt" = COALESCE("emailVerifiedAt", NOW()), "accreditedStatus" = 'APPROVED' WHERE "type" = 'INVESTOR';

-- CreateIndex
CREATE UNIQUE INDEX "User_emailVerificationToken_key" ON "User"("emailVerificationToken");
CREATE UNIQUE INDEX "User_passwordResetToken_key" ON "User"("passwordResetToken");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_adminApprovedById_fkey" FOREIGN KEY ("adminApprovedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "InvestorDocument" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "kind" "InvestorDocumentKind" NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvestorDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvestmentIntent" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "propertyId" TEXT NOT NULL,
    "status" "InvestmentIntentStatus" NOT NULL DEFAULT 'STARTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvestmentIntent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InvestmentIntent_userId_propertyId_key" ON "InvestmentIntent"("userId", "propertyId");

-- AddForeignKey
ALTER TABLE "InvestorDocument" ADD CONSTRAINT "InvestorDocument_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestmentIntent" ADD CONSTRAINT "InvestmentIntent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestmentIntent" ADD CONSTRAINT "InvestmentIntent_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

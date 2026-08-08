-- Expand investment intent lifecycle + deposit receipt evidence

CREATE TYPE "MeetingChannel" AS ENUM ('CALENDLY', 'WHATSAPP');

ALTER TYPE "InvestmentIntentStatus" ADD VALUE IF NOT EXISTS 'MEETING_REQUESTED';
ALTER TYPE "InvestmentIntentStatus" ADD VALUE IF NOT EXISTS 'AWAITING_WIRE';
ALTER TYPE "InvestmentIntentStatus" ADD VALUE IF NOT EXISTS 'COMPLETED';

ALTER TABLE "InvestmentIntent"
  ADD COLUMN IF NOT EXISTS "channel" "MeetingChannel",
  ADD COLUMN IF NOT EXISTS "intendedAmount" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "meetingNote" TEXT,
  ADD COLUMN IF NOT EXISTS "meetingRequestedAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "InvestmentIntent_status_updatedAt_idx"
  ON "InvestmentIntent"("status", "updatedAt");

ALTER TABLE "deposit_requests"
  ADD COLUMN IF NOT EXISTS "investmentIntentId" TEXT,
  ADD COLUMN IF NOT EXISTS "receiptStorageKey" TEXT,
  ADD COLUMN IF NOT EXISTS "receiptFileName" TEXT,
  ADD COLUMN IF NOT EXISTS "receiptMimeType" TEXT;

ALTER TABLE "deposit_requests"
  ADD CONSTRAINT "deposit_requests_investmentIntentId_fkey"
  FOREIGN KEY ("investmentIntentId") REFERENCES "InvestmentIntent"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

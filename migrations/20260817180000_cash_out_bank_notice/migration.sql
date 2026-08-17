-- AlterTable
ALTER TABLE "cash_out_requests" ADD COLUMN "receiptStorageKey" TEXT;
ALTER TABLE "cash_out_requests" ADD COLUMN "receiptFileName" TEXT;
ALTER TABLE "cash_out_requests" ADD COLUMN "receiptMimeType" TEXT;

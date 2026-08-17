-- Invalidate existing JWTs when a password is changed or reset.
ALTER TABLE "User" ADD COLUMN "sessionEpoch" INTEGER NOT NULL DEFAULT 0;

-- Property investment numbers are public-facing sequential IDs. Renumber existing
-- properties deterministically by creation date, starting at 33, then let the
-- database assign every future number.
CREATE SEQUENCE IF NOT EXISTS "Property_investmentId_seq";
ALTER SEQUENCE "Property_investmentId_seq" OWNED BY "Property"."investmentId";

WITH numbered AS (
  SELECT "id", ROW_NUMBER() OVER (ORDER BY "createdAt", "id") AS position
  FROM "Property"
)
UPDATE "Property" AS property
SET "investmentId" = -(32 + numbered.position)
FROM numbered
WHERE property."id" = numbered."id";

UPDATE "Property"
SET "investmentId" = -"investmentId";

ALTER TABLE "Property"
  ALTER COLUMN "investmentId" SET DEFAULT nextval('"Property_investmentId_seq"');

SELECT setval(
  '"Property_investmentId_seq"',
  GREATEST(COALESCE((SELECT MAX("investmentId") + 1 FROM "Property"), 33), 33),
  false
);

-- User IDs already autoincrement. Ensure their sequence can never allocate below
-- the requested base or collide with an existing user.
SELECT setval(
  '"User_id_seq"',
  GREATEST(COALESCE((SELECT MAX("id") + 1 FROM "User"), 33), 33),
  false
);

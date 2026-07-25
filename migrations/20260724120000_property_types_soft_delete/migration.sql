-- Property types catalog (replaces PropertyType enum) + soft deletes

-- Rename enum so the new table can use a clean name if needed later
ALTER TYPE "PropertyType" RENAME TO "PropertyType_enum_old";

CREATE TABLE "property_types" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "labelEn" TEXT NOT NULL,
    "labelEs" TEXT NOT NULL,
    "descriptionEn" TEXT NOT NULL DEFAULT '',
    "descriptionEs" TEXT NOT NULL DEFAULT '',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "property_types_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "property_types_code_key" ON "property_types"("code");
CREATE UNIQUE INDEX "property_types_slug_key" ON "property_types"("slug");

INSERT INTO "property_types" ("id", "code", "slug", "labelEn", "labelEs", "descriptionEn", "descriptionEs", "sortOrder", "updatedAt")
VALUES
  ('pt_build_to_sell', 'BUILD_TO_SELL', 'build-to-sell', 'Build to Sell', 'Construir para Vender', 'Residential developments positioned for disposition and targeted returns.', 'Desarrollos residenciales orientados a la venta y retornos definidos.', 1, CURRENT_TIMESTAMP),
  ('pt_build_to_rent', 'BUILD_TO_RENT', 'build-to-rent', 'Build to Rent', 'Construir para Rentar', 'Income-oriented projects designed for long-term rental performance.', 'Proyectos orientados a ingreso y desempeño de renta a largo plazo.', 2, CURRENT_TIMESTAMP),
  ('pt_fliphouse', 'FLIPHOUSE', 'fliphouses', 'Fliphouses', 'Fliphouses', 'Value-add acquisitions and renovations with defined execution timelines.', 'Adquisiciones y remodelaciones con plazos de ejecución definidos.', 3, CURRENT_TIMESTAMP),
  ('pt_mex_to_us', 'MEX_TO_US', 'mex-to-us', 'MEX to US', 'MEX a US', 'Cross-border opportunities centered on Mexico-to-United States capital deployment.', 'Oportunidades cross-border centradas en capital de México hacia Estados Unidos.', 4, CURRENT_TIMESTAMP),
  ('pt_us_to_mex', 'US_TO_MEX', 'us-to-mex', 'US to MEX', 'US a MEX', 'Cross-border opportunities centered on United States-to-Mexico capital deployment.', 'Oportunidades cross-border centradas en capital de Estados Unidos hacia México.', 5, CURRENT_TIMESTAMP);

ALTER TABLE "Property" ADD COLUMN "typeId" TEXT;
ALTER TABLE "Property" ADD COLUMN "deletedAt" TIMESTAMP(3);

UPDATE "Property" AS p
SET "typeId" = pt."id"
FROM "property_types" AS pt
WHERE pt."code" = p."type"::text;

ALTER TABLE "Property" ALTER COLUMN "typeId" SET NOT NULL;

ALTER TABLE "Property" DROP COLUMN "type";

DROP TYPE "PropertyType_enum_old";

CREATE INDEX "Property_deletedAt_idx" ON "Property"("deletedAt");
CREATE INDEX "Property_typeId_idx" ON "Property"("typeId");

ALTER TABLE "Property" ADD CONSTRAINT "Property_typeId_fkey"
  FOREIGN KEY ("typeId") REFERENCES "property_types"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

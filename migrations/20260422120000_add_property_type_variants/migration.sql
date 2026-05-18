-- AlterEnum: add fliphouses and cross-border project types
ALTER TYPE "PropertyType" ADD VALUE 'FLIPHOUSE';
ALTER TYPE "PropertyType" ADD VALUE 'MEX_TO_US';
ALTER TYPE "PropertyType" ADD VALUE 'US_TO_MEX';

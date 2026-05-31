-- AlterTable
ALTER TABLE "Vendor"
ADD COLUMN "businessName" TEXT,
ADD COLUMN "businessAddress" TEXT,
ADD COLUMN "city" TEXT,
ADD COLUMN "province" TEXT;

-- Backfill business name for existing records
UPDATE "Vendor"
SET "businessName" = "name"
WHERE "businessName" IS NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_phoneNumber_key" ON "Vendor"("phoneNumber");

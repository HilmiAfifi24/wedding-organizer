ALTER TYPE "AuditModule" ADD VALUE IF NOT EXISTS 'USER_PAYMENTS';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PaymentType') THEN
    CREATE TYPE "PaymentType" AS ENUM ('DP', 'INSTALLMENT', 'FINAL_PAYMENT');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PaymentTermStatus') THEN
    CREATE TYPE "PaymentTermStatus" AS ENUM ('UNPAID', 'PENDING_VERIFICATION', 'VERIFIED', 'REJECTED');
  END IF;
END $$;

CREATE TABLE "PaymentTerm" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "type" "PaymentType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" "PaymentTermStatus" NOT NULL DEFAULT 'UNPAID',
    "dueDate" TIMESTAMP(3),
    "sequence" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentTerm_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PaymentTerm_bookingId_idx" ON "PaymentTerm"("bookingId");
CREATE INDEX "PaymentTerm_status_idx" ON "PaymentTerm"("status");
CREATE UNIQUE INDEX "PaymentTerm_bookingId_sequence_key" ON "PaymentTerm"("bookingId", "sequence");

ALTER TABLE "PaymentTerm"
ADD CONSTRAINT "PaymentTerm_bookingId_fkey"
FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PaymentProof"
DROP CONSTRAINT IF EXISTS "PaymentProof_bookingId_key";

ALTER TABLE "PaymentProof"
ADD COLUMN "paymentTermId" TEXT,
ADD COLUMN "uploadedById" TEXT,
ADD COLUMN "amount" INTEGER;

INSERT INTO "PaymentTerm" (
  "id",
  "bookingId",
  "type",
  "amount",
  "status",
  "sequence",
  "createdAt",
  "updatedAt"
)
SELECT
  md5(b."id" || '-payment-term-' || COALESCE(b."createdAt"::TEXT, CURRENT_TIMESTAMP::TEXT)),
  b."id",
  'FINAL_PAYMENT'::"PaymentType",
  GREATEST(COALESCE(b."totalAmount", 0), 0),
  CASE
    WHEN pp."status" = 'VERIFIED' THEN 'VERIFIED'::"PaymentTermStatus"
    WHEN pp."status" = 'PENDING' THEN 'PENDING_VERIFICATION'::"PaymentTermStatus"
    WHEN pp."status" = 'REJECTED' THEN 'REJECTED'::"PaymentTermStatus"
    ELSE 'UNPAID'::"PaymentTermStatus"
  END,
  1,
  COALESCE(b."createdAt", CURRENT_TIMESTAMP),
  COALESCE(b."updatedAt", CURRENT_TIMESTAMP)
FROM "Booking" b
LEFT JOIN LATERAL (
  SELECT p."status"
  FROM "PaymentProof" p
  WHERE p."bookingId" = b."id"
  ORDER BY p."createdAt" DESC
  LIMIT 1
) pp ON TRUE;

UPDATE "PaymentProof" pp
SET
  "paymentTermId" = pt."id",
  "uploadedById" = b."userId",
  "amount" = GREATEST(COALESCE(b."totalAmount", 0), 0)
FROM "PaymentTerm" pt
JOIN "Booking" b ON b."id" = pt."bookingId"
WHERE pp."bookingId" = pt."bookingId"
  AND pt."sequence" = 1;

ALTER TABLE "PaymentProof"
ALTER COLUMN "paymentTermId" SET NOT NULL,
ALTER COLUMN "uploadedById" SET NOT NULL,
ALTER COLUMN "amount" SET NOT NULL;

ALTER TABLE "PaymentProof"
ADD CONSTRAINT "PaymentProof_paymentTermId_fkey"
FOREIGN KEY ("paymentTermId") REFERENCES "PaymentTerm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PaymentProof"
ADD CONSTRAINT "PaymentProof_uploadedById_fkey"
FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "PaymentProof_bookingId_idx" ON "PaymentProof"("bookingId");
CREATE INDEX "PaymentProof_paymentTermId_idx" ON "PaymentProof"("paymentTermId");
CREATE INDEX "PaymentProof_uploadedById_idx" ON "PaymentProof"("uploadedById");

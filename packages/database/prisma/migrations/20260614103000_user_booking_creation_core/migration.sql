ALTER TYPE "AuditModule" ADD VALUE IF NOT EXISTS 'USER_BOOKINGS';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PaymentStatus') THEN
    CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PARTIALLY_PAID', 'PAID');
  END IF;
END $$;

ALTER TABLE "Booking"
ADD COLUMN "bookingCode" TEXT,
ADD COLUMN "eventDate" TIMESTAMP(3),
ADD COLUMN "eventLocation" TEXT,
ADD COLUMN "customerName" TEXT,
ADD COLUMN "customerPhone" TEXT,
ADD COLUMN "customerEmail" TEXT,
ADD COLUMN "guestCount" INTEGER,
ADD COLUMN "specialRequest" TEXT,
ADD COLUMN "totalAmount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'UNPAID';

UPDATE "Booking"
SET
  "eventDate" = COALESCE("eventDate", "bookedAt"),
  "eventLocation" = COALESCE(NULLIF("eventLocation", ''), 'Lokasi acara belum diisi'),
  "customerName" = COALESCE(NULLIF("customerName", ''), 'Customer'),
  "customerPhone" = COALESCE(NULLIF("customerPhone", ''), '-'),
  "customerEmail" = COALESCE(NULLIF("customerEmail", ''), 'customer@placeholder.local'),
  "totalAmount" = COALESCE("totalAmount", 0),
  "paymentStatus" = COALESCE("paymentStatus", 'UNPAID'::"PaymentStatus");

WITH booking_rows AS (
  SELECT
    b."id",
    'WO-' ||
    TO_CHAR(COALESCE(b."createdAt", NOW()) AT TIME ZONE 'Asia/Jakarta', 'YYYYMMDD') ||
    '-' ||
    LPAD(
      ROW_NUMBER() OVER (
        PARTITION BY TO_CHAR(COALESCE(b."createdAt", NOW()) AT TIME ZONE 'Asia/Jakarta', 'YYYYMMDD')
        ORDER BY b."createdAt", b."id"
      )::TEXT,
      4,
      '0'
    ) AS code
  FROM "Booking" AS b
)
UPDATE "Booking" AS b
SET "bookingCode" = booking_rows.code
FROM booking_rows
WHERE booking_rows."id" = b."id"
  AND b."bookingCode" IS NULL;

ALTER TABLE "Booking"
ALTER COLUMN "bookingCode" SET NOT NULL,
ALTER COLUMN "eventDate" SET NOT NULL,
ALTER COLUMN "eventLocation" SET NOT NULL,
ALTER COLUMN "customerName" SET NOT NULL,
ALTER COLUMN "customerPhone" SET NOT NULL,
ALTER COLUMN "customerEmail" SET NOT NULL;

CREATE UNIQUE INDEX "Booking_bookingCode_key" ON "Booking"("bookingCode");
CREATE INDEX "Booking_bookingCode_idx" ON "Booking"("bookingCode");
CREATE INDEX "Booking_eventDate_idx" ON "Booking"("eventDate");
CREATE INDEX "Booking_paymentStatus_idx" ON "Booking"("paymentStatus");
CREATE INDEX "Booking_userId_vendorId_serviceId_eventDate_status_idx"
ON "Booking"("userId", "vendorId", "serviceId", "eventDate", "status");

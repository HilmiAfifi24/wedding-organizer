ALTER TYPE "AuditModule" ADD VALUE IF NOT EXISTS 'BOOKING_MANAGEMENT';

CREATE TABLE "BookingStatusHistory" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "previousStatus" "BookingStatus",
    "newStatus" "BookingStatus" NOT NULL,
    "changedById" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookingStatusHistory_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "BookingStatusHistory_bookingId_createdAt_idx" ON "BookingStatusHistory"("bookingId", "createdAt");
CREATE INDEX "BookingStatusHistory_changedById_idx" ON "BookingStatusHistory"("changedById");

ALTER TABLE "BookingStatusHistory"
ADD CONSTRAINT "BookingStatusHistory_bookingId_fkey"
FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BookingStatusHistory"
ADD CONSTRAINT "BookingStatusHistory_changedById_fkey"
FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

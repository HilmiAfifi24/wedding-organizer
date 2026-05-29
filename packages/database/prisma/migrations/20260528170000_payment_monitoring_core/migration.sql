CREATE TYPE "PaymentProofStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

ALTER TYPE "AuditModule" ADD VALUE IF NOT EXISTS 'PAYMENT_MONITORING';

ALTER TABLE "PaymentProof"
ADD COLUMN "status" "PaymentProofStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN "rejectedById" TEXT,
ADD COLUMN "rejectedAt" TIMESTAMP(3),
ADD COLUMN "rejectionReason" TEXT,
ADD COLUMN "verificationNote" TEXT,
ADD COLUMN "overriddenById" TEXT,
ADD COLUMN "overriddenAt" TIMESTAMP(3),
ADD COLUMN "overrideReason" TEXT;

CREATE TABLE "PaymentProofStatusHistory" (
    "id" TEXT NOT NULL,
    "paymentProofId" TEXT NOT NULL,
    "previousStatus" "PaymentProofStatus",
    "newStatus" "PaymentProofStatus" NOT NULL,
    "changedById" TEXT,
    "note" TEXT,
    "isOverride" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentProofStatusHistory_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PaymentProof_status_idx" ON "PaymentProof"("status");
CREATE INDEX "PaymentProof_verifiedById_idx" ON "PaymentProof"("verifiedById");
CREATE INDEX "PaymentProof_rejectedById_idx" ON "PaymentProof"("rejectedById");
CREATE INDEX "PaymentProof_overriddenById_idx" ON "PaymentProof"("overriddenById");
CREATE INDEX "PaymentProofStatusHistory_paymentProofId_createdAt_idx" ON "PaymentProofStatusHistory"("paymentProofId", "createdAt");
CREATE INDEX "PaymentProofStatusHistory_changedById_idx" ON "PaymentProofStatusHistory"("changedById");

ALTER TABLE "PaymentProof"
ADD CONSTRAINT "PaymentProof_rejectedById_fkey"
FOREIGN KEY ("rejectedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PaymentProof"
ADD CONSTRAINT "PaymentProof_overriddenById_fkey"
FOREIGN KEY ("overriddenById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PaymentProofStatusHistory"
ADD CONSTRAINT "PaymentProofStatusHistory_paymentProofId_fkey"
FOREIGN KEY ("paymentProofId") REFERENCES "PaymentProof"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PaymentProofStatusHistory"
ADD CONSTRAINT "PaymentProofStatusHistory_changedById_fkey"
FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

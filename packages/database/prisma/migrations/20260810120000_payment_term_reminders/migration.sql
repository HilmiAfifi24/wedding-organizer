ALTER TYPE "PaymentTermStatus" ADD VALUE IF NOT EXISTS 'OVERDUE';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PaymentReminderChannel') THEN
    CREATE TYPE "PaymentReminderChannel" AS ENUM ('WHATSAPP');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PaymentReminderType') THEN
    CREATE TYPE "PaymentReminderType" AS ENUM ('D7', 'D1', 'D0', 'OVERDUE');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PaymentReminderStatus') THEN
    CREATE TYPE "PaymentReminderStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');
  END IF;
END $$;

ALTER TABLE "PaymentTerm"
ADD COLUMN IF NOT EXISTS "lastReminderSentAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "lastReminderType" "PaymentReminderType",
ADD COLUMN IF NOT EXISTS "overdueMarkedAt" TIMESTAMP(3);

CREATE TABLE IF NOT EXISTS "PaymentReminderLog" (
  "id" TEXT NOT NULL,
  "paymentTermId" TEXT NOT NULL,
  "channel" "PaymentReminderChannel" NOT NULL,
  "reminderType" "PaymentReminderType" NOT NULL,
  "recipientPhone" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerMessageId" TEXT,
  "status" "PaymentReminderStatus" NOT NULL DEFAULT 'PENDING',
  "requestPayload" JSONB,
  "responsePayload" JSONB,
  "errorMessage" TEXT,
  "sentAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "PaymentReminderLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "PaymentReminderLog_paymentTermId_createdAt_idx"
ON "PaymentReminderLog"("paymentTermId", "createdAt");

CREATE INDEX IF NOT EXISTS "PaymentReminderLog_paymentTermId_reminderType_status_idx"
ON "PaymentReminderLog"("paymentTermId", "reminderType", "status");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'PaymentReminderLog_paymentTermId_fkey'
      AND table_name = 'PaymentReminderLog'
  ) THEN
    ALTER TABLE "PaymentReminderLog"
    ADD CONSTRAINT "PaymentReminderLog_paymentTermId_fkey"
    FOREIGN KEY ("paymentTermId") REFERENCES "PaymentTerm"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

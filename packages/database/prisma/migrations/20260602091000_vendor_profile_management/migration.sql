ALTER TYPE "AuditModule" ADD VALUE IF NOT EXISTS 'VENDOR_PROFILE';

ALTER TABLE "Vendor"
ADD COLUMN "businessType" TEXT,
ADD COLUMN "establishedYear" INTEGER,
ADD COLUMN "postalCode" TEXT,
ADD COLUMN "whatsappNumber" TEXT,
ADD COLUMN "website" TEXT,
ADD COLUMN "logoUrl" TEXT,
ADD COLUMN "coverImageUrl" TEXT,
ADD COLUMN "instagramUrl" TEXT,
ADD COLUMN "tiktokUrl" TEXT,
ADD COLUMN "facebookUrl" TEXT,
ADD COLUMN "youtubeUrl" TEXT,
ADD COLUMN "resubmittedAt" TIMESTAMP(3),
ADD COLUMN "suspensionReason" TEXT;

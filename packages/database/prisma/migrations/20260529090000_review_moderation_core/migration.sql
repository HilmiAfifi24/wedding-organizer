CREATE TYPE "ReviewStatus" AS ENUM ('VISIBLE', 'HIDDEN', 'DELETED');
CREATE TYPE "ReviewModerationAction" AS ENUM ('HIDE', 'UNHIDE', 'DELETE');

ALTER TYPE "AuditModule" ADD VALUE IF NOT EXISTS 'REVIEW_MODERATION';

ALTER TABLE "Review"
ADD COLUMN "status" "ReviewStatus" NOT NULL DEFAULT 'VISIBLE',
ADD COLUMN "hiddenAt" TIMESTAMP(3),
ADD COLUMN "hiddenById" TEXT,
ADD COLUMN "deletedAt" TIMESTAMP(3),
ADD COLUMN "deletedById" TEXT,
ADD COLUMN "moderationReason" TEXT;

CREATE TABLE "ReviewModerationHistory" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "action" "ReviewModerationAction" NOT NULL,
    "reason" TEXT,
    "actorId" TEXT,
    "beforeData" JSONB,
    "afterData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewModerationHistory_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Review_status_idx" ON "Review"("status");
CREATE INDEX "Review_hiddenAt_idx" ON "Review"("hiddenAt");
CREATE INDEX "Review_deletedAt_idx" ON "Review"("deletedAt");
CREATE INDEX "ReviewModerationHistory_reviewId_createdAt_idx" ON "ReviewModerationHistory"("reviewId", "createdAt");
CREATE INDEX "ReviewModerationHistory_actorId_idx" ON "ReviewModerationHistory"("actorId");

ALTER TABLE "Review"
ADD CONSTRAINT "Review_hiddenById_fkey"
FOREIGN KEY ("hiddenById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Review"
ADD CONSTRAINT "Review_deletedById_fkey"
FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ReviewModerationHistory"
ADD CONSTRAINT "ReviewModerationHistory_reviewId_fkey"
FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ReviewModerationHistory"
ADD CONSTRAINT "ReviewModerationHistory_actorId_fkey"
FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

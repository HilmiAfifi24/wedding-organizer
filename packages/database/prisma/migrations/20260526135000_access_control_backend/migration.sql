-- AlterTable
ALTER TABLE "User" ADD COLUMN "accessProfileId" TEXT;

-- CreateTable
CREATE TABLE "AccessMenu" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "path" TEXT,
    "icon" TEXT,
    "parentId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccessMenu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccessProfile" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccessProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccessPermission" (
    "id" TEXT NOT NULL,
    "accessProfileId" TEXT NOT NULL,
    "accessMenuId" TEXT NOT NULL,
    "canView" BOOLEAN NOT NULL DEFAULT false,
    "canInsert" BOOLEAN NOT NULL DEFAULT false,
    "canUpdate" BOOLEAN NOT NULL DEFAULT false,
    "canUpsert" BOOLEAN NOT NULL DEFAULT false,
    "canDelete" BOOLEAN NOT NULL DEFAULT false,
    "canHistory" BOOLEAN NOT NULL DEFAULT false,
    "customEvents" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccessPermission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AccessMenu_code_key" ON "AccessMenu"("code");

-- CreateIndex
CREATE INDEX "AccessMenu_parentId_idx" ON "AccessMenu"("parentId");

-- CreateIndex
CREATE INDEX "AccessMenu_sortOrder_idx" ON "AccessMenu"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "AccessProfile_code_key" ON "AccessProfile"("code");

-- CreateIndex
CREATE UNIQUE INDEX "AccessProfile_name_key" ON "AccessProfile"("name");

-- CreateIndex
CREATE UNIQUE INDEX "AccessPermission_accessProfileId_accessMenuId_key" ON "AccessPermission"("accessProfileId", "accessMenuId");

-- CreateIndex
CREATE INDEX "AccessPermission_accessProfileId_idx" ON "AccessPermission"("accessProfileId");

-- CreateIndex
CREATE INDEX "AccessPermission_accessMenuId_idx" ON "AccessPermission"("accessMenuId");

-- CreateIndex
CREATE INDEX "User_accessProfileId_idx" ON "User"("accessProfileId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_accessProfileId_fkey" FOREIGN KEY ("accessProfileId") REFERENCES "AccessProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessMenu" ADD CONSTRAINT "AccessMenu_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "AccessMenu"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessPermission" ADD CONSTRAINT "AccessPermission_accessProfileId_fkey" FOREIGN KEY ("accessProfileId") REFERENCES "AccessProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessPermission" ADD CONSTRAINT "AccessPermission_accessMenuId_fkey" FOREIGN KEY ("accessMenuId") REFERENCES "AccessMenu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

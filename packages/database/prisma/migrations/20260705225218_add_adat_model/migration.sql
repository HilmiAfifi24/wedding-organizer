-- DropIndex
DROP INDEX "PaymentProof_bookingId_key";

-- AlterTable
ALTER TABLE "PaymentTerm" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateTable
CREATE TABLE "Adat" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Adat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AdatToService" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Adat_name_key" ON "Adat"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_AdatToService_AB_unique" ON "_AdatToService"("A", "B");

-- CreateIndex
CREATE INDEX "_AdatToService_B_index" ON "_AdatToService"("B");

-- AddForeignKey
ALTER TABLE "_AdatToService" ADD CONSTRAINT "_AdatToService_A_fkey" FOREIGN KEY ("A") REFERENCES "Adat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AdatToService" ADD CONSTRAINT "_AdatToService_B_fkey" FOREIGN KEY ("B") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

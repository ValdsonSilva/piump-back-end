/*
  Warnings:

  - You are about to drop the column `bins` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `plan` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `userType` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[stripePaymentIntentId]` on the table `Booking` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `categoryId` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `requesterId` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serviceZip` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('INDIVIDUAL', 'BUSINESS_CLIENT', 'PROVIDER');

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_userId_fkey";

-- DropIndex
DROP INDEX "Booking_userId_idx";

-- DropIndex
DROP INDEX "User_password_key";

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "bins",
DROP COLUMN "plan",
DROP COLUMN "userId",
ADD COLUMN     "categoryId" INTEGER NOT NULL,
ADD COLUMN     "providerId" TEXT,
ADD COLUMN     "requesterId" TEXT NOT NULL,
ADD COLUMN     "serviceZip" TEXT NOT NULL,
ADD COLUMN     "stripePaymentIntentId" TEXT,
ALTER COLUMN "assignedDate" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "userType",
ADD COLUMN     "accountType" "AccountType" NOT NULL DEFAULT 'INDIVIDUAL',
ADD COLUMN     "isAdmin" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "phone" DROP NOT NULL,
ALTER COLUMN "address" DROP NOT NULL,
ALTER COLUMN "zip" DROP NOT NULL;

-- CreateTable
CREATE TABLE "BusinessClientProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "ein" TEXT,
    "businessCategory" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessClientProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Provider" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "registrationNumber" TEXT,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip" TEXT,
    "operatesAM" BOOLEAN NOT NULL DEFAULT true,
    "operatesPM" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Provider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "ServiceCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationDocument" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerificationDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingBinCleaningDetails" (
    "bookingId" TEXT NOT NULL,
    "bins" INTEGER,
    "plan" "Plan",
    "description" TEXT,

    CONSTRAINT "BookingBinCleaningDetails_pkey" PRIMARY KEY ("bookingId")
);

-- CreateTable
CREATE TABLE "_BusinessClientProfileToServiceCategory" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_ProviderToServiceCategory" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_ProviderToZipWhitelist" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "BusinessClientProfile_userId_key" ON "BusinessClientProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Provider_userId_key" ON "Provider"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceCategory_name_key" ON "ServiceCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceCategory_slug_key" ON "ServiceCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "_BusinessClientProfileToServiceCategory_AB_unique" ON "_BusinessClientProfileToServiceCategory"("A", "B");

-- CreateIndex
CREATE INDEX "_BusinessClientProfileToServiceCategory_B_index" ON "_BusinessClientProfileToServiceCategory"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ProviderToServiceCategory_AB_unique" ON "_ProviderToServiceCategory"("A", "B");

-- CreateIndex
CREATE INDEX "_ProviderToServiceCategory_B_index" ON "_ProviderToServiceCategory"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ProviderToZipWhitelist_AB_unique" ON "_ProviderToZipWhitelist"("A", "B");

-- CreateIndex
CREATE INDEX "_ProviderToZipWhitelist_B_index" ON "_ProviderToZipWhitelist"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_stripePaymentIntentId_key" ON "Booking"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "Booking_categoryId_serviceZip_status_idx" ON "Booking"("categoryId", "serviceZip", "status");

-- CreateIndex
CREATE INDEX "Booking_requesterId_idx" ON "Booking"("requesterId");

-- CreateIndex
CREATE INDEX "Booking_providerId_idx" ON "Booking"("providerId");

-- AddForeignKey
ALTER TABLE "BusinessClientProfile" ADD CONSTRAINT "BusinessClientProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Provider" ADD CONSTRAINT "Provider_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationDocument" ADD CONSTRAINT "VerificationDocument_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ServiceCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingBinCleaningDetails" ADD CONSTRAINT "BookingBinCleaningDetails_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BusinessClientProfileToServiceCategory" ADD CONSTRAINT "_BusinessClientProfileToServiceCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "BusinessClientProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BusinessClientProfileToServiceCategory" ADD CONSTRAINT "_BusinessClientProfileToServiceCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "ServiceCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProviderToServiceCategory" ADD CONSTRAINT "_ProviderToServiceCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProviderToServiceCategory" ADD CONSTRAINT "_ProviderToServiceCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "ServiceCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProviderToZipWhitelist" ADD CONSTRAINT "_ProviderToZipWhitelist_A_fkey" FOREIGN KEY ("A") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProviderToZipWhitelist" ADD CONSTRAINT "_ProviderToZipWhitelist_B_fkey" FOREIGN KEY ("B") REFERENCES "ZipWhitelist"("zip") ON DELETE CASCADE ON UPDATE CASCADE;

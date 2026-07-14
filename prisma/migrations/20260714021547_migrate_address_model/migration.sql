/*
  Warnings:

  - You are about to drop the column `name` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `streetAddress` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `zipCode` on the `Address` table. All the data in the column will be lost.
  - Added the required column `addressLine1` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullName` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `postalCode` to the `Address` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AddressType" AS ENUM ('HOME', 'WORK', 'OTHER');

-- AlterTable
ALTER TABLE "Address" DROP COLUMN "name",
DROP COLUMN "streetAddress",
DROP COLUMN "title",
DROP COLUMN "zipCode",
ADD COLUMN     "addressLine1" TEXT NOT NULL,
ADD COLUMN     "addressLine2" TEXT,
ADD COLUMN     "addressType" "AddressType" NOT NULL DEFAULT 'HOME',
ADD COLUMN     "country" TEXT NOT NULL DEFAULT 'India',
ADD COLUMN     "fullName" TEXT NOT NULL,
ADD COLUMN     "landmark" TEXT,
ADD COLUMN     "postalCode" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Address_userId_idx" ON "Address"("userId");

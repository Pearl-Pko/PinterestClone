/*
  Warnings:

  - You are about to drop the column `expiry` on the `Post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Post" DROP COLUMN "expiry",
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ALTER COLUMN "status" SET DEFAULT 'draft';

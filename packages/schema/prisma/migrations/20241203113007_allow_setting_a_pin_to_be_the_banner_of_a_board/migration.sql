/*
  Warnings:

  - You are about to drop the column `banner` on the `Board` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[banner_id]` on the table `Board` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Board" DROP COLUMN "banner",
ADD COLUMN     "banner_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Board_banner_id_key" ON "Board"("banner_id");

-- AddForeignKey
ALTER TABLE "Board" ADD CONSTRAINT "Board_banner_id_fkey" FOREIGN KEY ("banner_id") REFERENCES "Pin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

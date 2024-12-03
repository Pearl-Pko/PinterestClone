/*
  Warnings:

  - Added the required column `description` to the `Board` table without a default value. This is not possible if the table is not empty.
  - Made the column `board_id` on table `Pin` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Pin" DROP CONSTRAINT "Pin_board_id_fkey";

-- AlterTable
ALTER TABLE "Board" ADD COLUMN     "banner" TEXT,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "description" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Pin" ADD COLUMN     "private_note" VARCHAR(500),
ALTER COLUMN "board_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Pin" ADD CONSTRAINT "Pin_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "Board"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

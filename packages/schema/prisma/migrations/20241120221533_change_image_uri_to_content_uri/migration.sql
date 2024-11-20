/*
  Warnings:

  - You are about to drop the column `image_url` on the `Post` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id]` on the table `Session` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `content_uri` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Post" DROP COLUMN "image_url",
ADD COLUMN     "content_uri" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Session_id_key" ON "Session"("id");

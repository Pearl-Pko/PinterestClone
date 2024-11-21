-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('Draft', 'Posted');

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "expiry" TIMESTAMP(3),
ADD COLUMN     "status" "PostStatus" NOT NULL DEFAULT 'Posted';

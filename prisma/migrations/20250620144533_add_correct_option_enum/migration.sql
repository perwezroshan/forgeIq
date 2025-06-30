/*
  Warnings:

  - Changed the type of `correctOption` on the `Question` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "CorrectOption" AS ENUM ('A', 'B', 'C', 'D');

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "correctOption",
ADD COLUMN     "correctOption" "CorrectOption" NOT NULL;

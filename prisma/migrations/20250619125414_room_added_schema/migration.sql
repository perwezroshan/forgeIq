/*
  Warnings:

  - You are about to drop the column `answerIdx` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `options` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `adminId` on the `Quiz` table. All the data in the column will be lost.
  - You are about to drop the column `durationPerQuestion` on the `Quiz` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `Quiz` table. All the data in the column will be lost.
  - You are about to drop the column `quizCode` on the `Quiz` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `Quiz` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `correctOption` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `marks` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `optionA` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `optionB` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `optionC` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `optionD` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `creatorId` to the `Quiz` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Quiz` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Quiz" DROP CONSTRAINT "Quiz_adminId_fkey";

-- DropIndex
DROP INDEX "Quiz_quizCode_key";

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "answerIdx",
DROP COLUMN "options",
ADD COLUMN     "correctOption" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "marks" INTEGER NOT NULL,
ADD COLUMN     "optionA" TEXT NOT NULL,
ADD COLUMN     "optionB" TEXT NOT NULL,
ADD COLUMN     "optionC" TEXT NOT NULL,
ADD COLUMN     "optionD" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Quiz" DROP COLUMN "adminId",
DROP COLUMN "durationPerQuestion",
DROP COLUMN "endTime",
DROP COLUMN "quizCode",
DROP COLUMN "startTime",
ADD COLUMN     "creatorId" TEXT NOT NULL,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "duration" INTEGER NOT NULL DEFAULT 30;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "name",
ADD COLUMN     "username" TEXT NOT NULL,
ALTER COLUMN "role" SET DEFAULT 'PARTICIPANT';

-- CreateTable
CREATE TABLE "QuizRoom" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "inviteCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),

    CONSTRAINT "QuizRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Participation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "quizRoomId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "score" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "Participation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParticipantAnswer" (
    "id" TEXT NOT NULL,
    "participationId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "selectedOption" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "marks" INTEGER NOT NULL,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ParticipantAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QuizRoom_inviteCode_key" ON "QuizRoom"("inviteCode");

-- CreateIndex
CREATE UNIQUE INDEX "ParticipantAnswer_participationId_questionId_key" ON "ParticipantAnswer"("participationId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizRoom" ADD CONSTRAINT "QuizRoom_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participation" ADD CONSTRAINT "Participation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participation" ADD CONSTRAINT "Participation_quizRoomId_fkey" FOREIGN KEY ("quizRoomId") REFERENCES "QuizRoom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParticipantAnswer" ADD CONSTRAINT "ParticipantAnswer_participationId_fkey" FOREIGN KEY ("participationId") REFERENCES "Participation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParticipantAnswer" ADD CONSTRAINT "ParticipantAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

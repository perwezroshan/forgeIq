import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { z } from "zod";

const ParticipateSchema = z.object({
  answers: z.record(z.string(), z.enum(["A", "B", "C", "D"])),
});

export async function POST(req: Request, { params }: { params: Promise<{ inviteCode: string }> }) {
  try {
    const { inviteCode } = await params;
    console.log('Participate in quiz route called with inviteCode:', inviteCode);

    const authHeader = req.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token) as any;
    if (decoded.role !== "PARTICIPANT") return NextResponse.json({ error: "Only participants can take quizzes" }, { status: 403 });

    const body = await req.json();
    const { answers } = ParticipateSchema.parse(body);

    const quizRoom = await prisma.quizRoom.findUnique({
      where: { inviteCode },
      include: { 
        quiz: {
          include: {
            questions: true
          }
        }
      },
    });

    if (!quizRoom) return NextResponse.json({ error: "Quiz room not found" }, { status: 404 });

    // Check if quiz is active
    const now = new Date();
    const isActive = (!quizRoom.startTime || now >= quizRoom.startTime) && 
                    (!quizRoom.endTime || now <= quizRoom.endTime);

    if (!isActive) {
      return NextResponse.json({ error: "Quiz is not currently active" }, { status: 400 });
    }

    // Check if user already participated
    const existingParticipation = await prisma.participation.findFirst({
      where: {
        quizRoomId: quizRoom.id,
        userId: decoded.id
      }
    });

    if (existingParticipation) {
      return NextResponse.json({ error: "You have already taken this quiz" }, { status: 400 });
    }

    // Create participation record first
    const participation = await prisma.participation.create({
      data: {
        userId: decoded.id,
        quizRoomId: quizRoom.id,
        joinedAt: new Date(),
        completed: true,
        finishedAt: new Date(),
      }
    });

    // Calculate score
    let totalScore = 0;
    let totalMarks = 0;
    const answerDetails = [];

    for (const question of quizRoom.quiz.questions) {
      totalMarks += question.marks;
      const userAnswer = answers[question.id];
      const isCorrect = userAnswer === question.correctOption;

      if (isCorrect) {
        totalScore += question.marks;
      }

      answerDetails.push({
        questionId: question.id,
        selectedOption: userAnswer || null,
        isCorrect
      });

      // Save individual answer
      if (userAnswer) {
        await prisma.participantAnswer.create({
          data: {
            participationId: participation.id,
            questionId: question.id,
            selectedOption: userAnswer,
            isCorrect: isCorrect,
            marks: isCorrect ? question.marks : 0,
          }
        });
      }
    }

    // Update participation with final score
    await prisma.participation.update({
      where: { id: participation.id },
      data: { score: totalScore }
    });

    return NextResponse.json({
      message: "Quiz submitted successfully",
      score: totalScore,
      totalMarks: totalMarks,
      percentage: totalMarks > 0 ? Math.round((totalScore / totalMarks) * 100) : 0,
      answerDetails,
      participationId: participation.id
    });
  } catch (error) {
    console.error('Participate in quiz error:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

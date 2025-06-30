import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token) as any;
    if (decoded.role !== "PARTICIPANT") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const participations = await prisma.participation.findMany({
      where: { 
        userId: decoded.id,
        completed: true
      },
      include: {
        quizRoom: {
          include: {
            quiz: {
              select: {
                id: true,
                title: true,
                description: true,
                creator: {
                  select: {
                    username: true
                  }
                }
              }
            }
          }
        },
        participantAnswers: {
          include: {
            question: {
              select: {
                marks: true
              }
            }
          }
        }
      },
      orderBy: { finishedAt: 'desc' }
    });

    const quizHistory = participations.map(participation => {
      const totalMarks = participation.participantAnswers.reduce(
        (sum, answer) => sum + answer.question.marks, 0
      );
      const percentage = totalMarks > 0 ? Math.round((participation.score / totalMarks) * 100) : 0;

      return {
        id: participation.id,
        quiz: {
          title: participation.quizRoom.quiz.title,
          description: participation.quizRoom.quiz.description,
          creator: participation.quizRoom.quiz.creator.username
        },
        score: participation.score,
        totalMarks,
        percentage,
        completedAt: participation.finishedAt,
        inviteCode: participation.quizRoom.inviteCode
      };
    });

    return NextResponse.json({ quizHistory });
  } catch (error) {
    console.error('Get quiz history error:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

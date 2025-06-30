import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token) as any;
    if (decoded.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // Get recent quizzes with analytics
    const recentQuizzes = await prisma.quiz.findMany({
      where: { creatorId: decoded.id },
      include: {
        quizRooms: {
          include: {
            participations: {
              where: { completed: true },
              include: {
                user: {
                  select: {
                    username: true,
                    email: true
                  }
                }
              },
              orderBy: { finishedAt: 'desc' }
            }
          }
        },
        questions: {
          select: {
            marks: true
          }
        },
        _count: {
          select: {
            questions: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    const analytics = recentQuizzes.map(quiz => {
      const quizRoom = quiz.quizRooms[0]; // Assuming one room per quiz for now
      const participations = quizRoom?.participations || [];
      
      const totalMarks = quiz.questions.reduce((sum, q) => sum + q.marks, 0);
      const averageScore = participations.length > 0 
        ? participations.reduce((sum, p) => sum + p.score, 0) / participations.length 
        : 0;
      const averagePercentage = totalMarks > 0 ? Math.round((averageScore / totalMarks) * 100) : 0;

      // Recent submissions (last 5)
      const recentSubmissions = participations.slice(0, 5).map(p => ({
        participantName: p.user.username,
        score: p.score,
        totalMarks,
        percentage: totalMarks > 0 ? Math.round((p.score / totalMarks) * 100) : 0,
        completedAt: p.finishedAt
      }));

      return {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        createdAt: quiz.createdAt,
        inviteCode: quizRoom?.inviteCode || null,
        questionCount: quiz._count.questions,
        participantCount: participations.length,
        averageScore,
        averagePercentage,
        totalMarks,
        recentSubmissions
      };
    });

    return NextResponse.json({ analytics });
  } catch (error) {
    console.error('Get quiz analytics error:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

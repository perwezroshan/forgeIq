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

    const quizzes = await prisma.quiz.findMany({
      where: { creatorId: decoded.id },
      include: {
        quizRooms: {
          select: {
            id: true,
            inviteCode: true,
            startTime: true,
            endTime: true,
          }
        },
        questions: {
          select: {
            id: true,
          }
        },
        _count: {
          select: {
            questions: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ quizzes });
  } catch (error) {
    console.error('Get my quizzes error:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

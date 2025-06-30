import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: Promise<{ inviteCode: string }> }) {
  try {
    const { inviteCode } = await params;
    console.log('Submit quiz route called with inviteCode:', inviteCode);

    const authHeader = req.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token) as any;
    if (decoded.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

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

    // Confirm that the requesting admin is the owner of this quiz
    if (quizRoom.quiz.creatorId !== decoded.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if quiz has questions
    if (quizRoom.quiz.questions.length === 0) {
      return NextResponse.json({ error: "Cannot submit quiz without questions" }, { status: 400 });
    }

    // Update quiz room to mark as submitted/published
    const updatedQuizRoom = await prisma.quizRoom.update({
      where: { inviteCode },
      data: {
        // You can add a published field to schema later, for now we'll just return success
      },
      include: {
        quiz: {
          include: {
            questions: true
          }
        }
      }
    });

    return NextResponse.json({ 
      message: "Quiz submitted successfully", 
      quizRoom: updatedQuizRoom,
      participantLink: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/quiz/${inviteCode}`
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

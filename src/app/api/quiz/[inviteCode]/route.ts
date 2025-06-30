import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ inviteCode: string }> }) {
  try {
    const { inviteCode } = await params;
    console.log('Get quiz route called with inviteCode:', inviteCode);

    const quizRoom = await prisma.quizRoom.findUnique({
      where: { inviteCode },
      include: { 
        quiz: {
          include: {
            questions: {
              select: {
                id: true,
                text: true,
                optionA: true,
                optionB: true,
                optionC: true,
                optionD: true,
                marks: true,
                // Don't include correctOption for participants
              }
            },
            creator: {
              select: {
                id: true,
                username: true,
                email: true
              }
            }
          }
        }
      },
    });

    if (!quizRoom) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Check if quiz is within time bounds
    const now = new Date();
    const isActive = (!quizRoom.startTime || now >= quizRoom.startTime) && 
                    (!quizRoom.endTime || now <= quizRoom.endTime);

    return NextResponse.json({ 
      quizRoom: {
        ...quizRoom,
        isActive
      }
    });
  } catch (error) {
    console.error('Get quiz error:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

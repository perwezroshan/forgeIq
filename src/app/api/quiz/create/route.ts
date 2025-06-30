import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

const CreateQuizSchema = z.object({
  title: z.string().min(3),
  description: z.string(),
  startTime: z.string(),  // ISO string
  endTime: z.string(),    // ISO string
});

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token) as any;
    if (decoded.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { title, description, startTime, endTime } = CreateQuizSchema.parse(body);

    // Validate dates
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
    }

    if (startDate >= endDate) {
      return NextResponse.json({ error: "End time must be after start time" }, { status: 400 });
    }

    // Step 1: Create the Quiz itself
    const quiz = await prisma.quiz.create({
      data: {
        title,
        description,
        creatorId: decoded.id,
      },
    });

    // Step 2: Create associated Quiz Room (with inviteCode)
    const inviteCode = uuidv4().slice(0, 8);

    const quizRoom = await prisma.quizRoom.create({
      data: {
        quizId: quiz.id,
        inviteCode,
        startTime: startDate,
        endTime: endDate,
      },
    });

    return NextResponse.json({
      message: "Quiz created successfully",
      quiz,
      quizRoom,
      inviteLink: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/quiz/${inviteCode}`,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

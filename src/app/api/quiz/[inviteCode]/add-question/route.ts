import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { z } from "zod";

const AddQuestionSchema = z.object({
  text: z.string().min(1),
  optionA: z.string(),
  optionB: z.string(),
  optionC: z.string(),
  optionD: z.string(),
  correctOption: z.enum(["A", "B", "C", "D"]),
  marks: z.number().min(1),
});

export async function POST(req: Request, { params }: { params: Promise<{ inviteCode: string }> }) {
  try {
    const { inviteCode } = await params;
    console.log('Add question route called with inviteCode:', inviteCode);

    const authHeader = req.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token) as any;
    if (decoded.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const quizRoom = await prisma.quizRoom.findUnique({
      where: { inviteCode },
      include: { quiz: true },
    });

    if (!quizRoom) return NextResponse.json({ error: "Quiz room not found" }, { status: 404 });

    // Confirm that the requesting admin is the owner of this quiz
    if (quizRoom.quiz.creatorId !== decoded.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { text, optionA, optionB, optionC, optionD, correctOption, marks } = AddQuestionSchema.parse(body);

    const question = await prisma.question.create({
      data: {
        quizId: quizRoom.quizId,
        text,
        optionA,
        optionB,
        optionC,
        optionD,
        correctOption,
        marks,
      },
    });

    return NextResponse.json({ message: "Question added successfully", question });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

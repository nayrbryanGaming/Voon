import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { generateQuiz } from "@/lib/anthropic";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { transcript, topic, difficulty } = await req.json();
  if (!transcript) return NextResponse.json({ error: "transcript required" }, { status: 400 });

  try {
    const data = await generateQuiz(transcript, topic ?? "Materi", difficulty ?? "medium");
    return NextResponse.json(data);
  } catch (err) {
    console.error("AI quiz error:", err);
    return NextResponse.json({ error: "AI service error" }, { status: 500 });
  }
}

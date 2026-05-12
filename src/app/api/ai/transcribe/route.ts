import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { anthropic, AI_MODEL } from "@/lib/anthropic";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { meetingId, content } = await req.json();
  if (!content) return NextResponse.json({ error: "content required" }, { status: 400 });

  // Save transcript to DB
  if (meetingId) {
    await prisma.transcript.upsert({
      where: { meetingId },
      create: { meetingId, content },
      update: { content },
    });
  }

  return NextResponse.json({ success: true, length: content.length });
}

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const meetingId = searchParams.get("meetingId");
  if (!meetingId) return NextResponse.json({ error: "meetingId required" }, { status: 400 });

  const transcript = await prisma.transcript.findUnique({ where: { meetingId } });
  return NextResponse.json(transcript ?? { content: "" });
}

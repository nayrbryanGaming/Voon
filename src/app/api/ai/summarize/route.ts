import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { summarizeMeeting } from "@/lib/anthropic";

export const maxDuration = 60;
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { meetingId, transcript, title, duration } = await req.json();

  if (!transcript) return NextResponse.json({ error: "transcript required" }, { status: 400 });

  try {
    const data = await summarizeMeeting(transcript, title ?? "Meeting", duration ?? 0);

    if (meetingId) {
      await prisma.meetingSummary.upsert({
        where: { meetingId },
        create: {
          meetingId,
          summary: data.summary ?? "",
          keyPoints: data.keyPoints ?? [],
          actionItems: data.actionItems ?? [],
          topics: data.topics ?? [],
          sentiment: data.sentiment ?? null,
        },
        update: {
          summary: data.summary ?? "",
          keyPoints: data.keyPoints ?? [],
          actionItems: data.actionItems ?? [],
          topics: data.topics ?? [],
          sentiment: data.sentiment ?? null,
        },
      });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("AI summarize error:", err);
    return NextResponse.json({ error: "AI service error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const meetingId = searchParams.get("meetingId");
  if (!meetingId) return NextResponse.json({ error: "meetingId required" }, { status: 400 });

  const polls = await prisma.poll.findMany({
    where: { meetingId },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(polls);
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { meetingId, question, options } = await req.json();
  if (!meetingId || !question || !Array.isArray(options) || options.length < 2) {
    return NextResponse.json({ error: "Invalid poll data" }, { status: 400 });
  }

  const votes: Record<string, number> = {};
  for (const opt of options) votes[opt] = 0;

  const poll = await prisma.poll.create({
    data: { meetingId, question, options, votes },
  });

  return NextResponse.json({ ...poll, totalVotes: 0, voted: false });
}

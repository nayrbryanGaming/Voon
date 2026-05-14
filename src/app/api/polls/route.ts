import { NextRequest, NextResponse } from "next/server";
import { getServerUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const userId = await getServerUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const meetingId = searchParams.get("meetingId");
  if (!meetingId) return NextResponse.json({ error: "meetingId required" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Verify access — host or attendee
  const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } });
  if (!meeting) return NextResponse.json({ error: "Meeting not found" }, { status: 404 });

  const isHost = meeting.hostId === user.id;
  if (!isHost && !meeting.isPublic) {
    const attendance = await prisma.attendance.findUnique({
      where: { meetingId_userId: { meetingId, userId: user.id } },
    });
    if (!attendance) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const polls = await prisma.poll.findMany({
    where: { meetingId },
    orderBy: { createdAt: "asc" },
  });

  // Strip internal voter tracking keys from votes
  const clean = polls.map((p) => {
    const votes = p.votes as Record<string, number> | null;
    const publicVotes: Record<string, number> = {};
    if (votes) {
      for (const [k, v] of Object.entries(votes)) {
        if (!k.startsWith("__voter_")) publicVotes[k] = v;
      }
    }
    return { ...p, votes: publicVotes };
  });

  return NextResponse.json(clean);
}

export async function POST(req: NextRequest) {
  const userId = await getServerUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { meetingId, question, options, isAnon } = await req.json();

  if (!meetingId || typeof meetingId !== "string") {
    return NextResponse.json({ error: "meetingId required" }, { status: 400 });
  }
  if (!question || typeof question !== "string" || question.trim().length < 5) {
    return NextResponse.json({ error: "question must be at least 5 characters" }, { status: 400 });
  }
  if (!Array.isArray(options) || options.length < 2 || options.length > 10) {
    return NextResponse.json({ error: "options must have 2–10 items" }, { status: 400 });
  }
  for (const opt of options) {
    if (typeof opt !== "string" || opt.trim().length === 0 || opt.trim().length > 200) {
      return NextResponse.json({ error: "Each option must be 1–200 characters" }, { status: 400 });
    }
  }

  // Only host of that meeting may create polls
  const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } });
  if (!meeting) return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
  if (meeting.hostId !== user.id) return NextResponse.json({ error: "Forbidden — only host can create polls" }, { status: 403 });

  const cleanOptions = options.map((o: string) => o.trim());
  const votes: Record<string, number> = {};
  for (const opt of cleanOptions) votes[opt] = 0;

  const poll = await prisma.poll.create({
    data: { meetingId, question: question.trim(), options: cleanOptions, votes, isAnon: Boolean(isAnon) },
  });

  return NextResponse.json({ ...poll, totalVotes: 0, voted: false });
}

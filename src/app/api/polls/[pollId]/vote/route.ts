import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ pollId: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { pollId } = await params;
  const { option } = await req.json();
  if (option === undefined || option === null) {
    return NextResponse.json({ error: "option required" }, { status: 400 });
  }

  const poll = await prisma.poll.findUnique({
    where: { id: pollId },
    include: { meeting: { select: { hostId: true } } },
  });
  if (!poll) return NextResponse.json({ error: "Poll not found" }, { status: 404 });
  if (!poll.isActive) return NextResponse.json({ error: "Poll is closed" }, { status: 400 });

  // Validate option is within the options array
  const optionStr = String(option);
  if (!poll.options.includes(optionStr)) {
    return NextResponse.json({ error: "Invalid option" }, { status: 400 });
  }

  // Verify user is meeting host or attendee
  const isHost = poll.meeting.hostId === user.id;
  if (!isHost) {
    const attendance = await prisma.attendance.findUnique({
      where: { meetingId_userId: { meetingId: poll.meetingId, userId: user.id } },
    });
    if (!attendance) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const votes = (poll.votes as Record<string, number>) ?? {};

  // Simple duplicate vote check — track voted users in a separate key namespace
  const voterKey = `__voter_${user.id}`;
  if (votes[voterKey]) {
    return NextResponse.json({ error: "Already voted" }, { status: 409 });
  }

  votes[optionStr] = (votes[optionStr] ?? 0) + 1;
  if (!poll.isAnon) {
    votes[voterKey] = 1;
  }

  const updated = await prisma.poll.update({
    where: { id: pollId },
    data: { votes },
  });

  // Strip internal voter keys from response
  const publicVotes: Record<string, number> = {};
  for (const [k, v] of Object.entries(votes)) {
    if (!k.startsWith("__voter_")) publicVotes[k] = v as number;
  }
  const totalVotes = Object.values(publicVotes).reduce((a, b) => a + b, 0);

  return NextResponse.json({ ...updated, votes: publicVotes, totalVotes, voted: true });
}

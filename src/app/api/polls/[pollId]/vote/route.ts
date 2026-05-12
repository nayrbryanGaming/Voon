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

  const { pollId } = await params;
  const { option } = await req.json();
  if (!option) return NextResponse.json({ error: "option required" }, { status: 400 });

  const poll = await prisma.poll.findUnique({ where: { id: pollId } });
  if (!poll) return NextResponse.json({ error: "Poll not found" }, { status: 404 });

  const votes = (poll.votes as Record<string, number>) ?? {};
  votes[option] = (votes[option] ?? 0) + 1;

  const updated = await prisma.poll.update({
    where: { id: pollId },
    data: { votes },
  });

  const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);

  return NextResponse.json({ ...updated, totalVotes, voted: true });
}

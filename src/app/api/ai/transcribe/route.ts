import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { meetingId, content } = await req.json();
  if (!content || typeof content !== "string") {
    return NextResponse.json({ error: "content required" }, { status: 400 });
  }
  if (content.length > 500_000) {
    return NextResponse.json({ error: "Transcript too large" }, { status: 413 });
  }

  if (meetingId) {
    // Verify user is host or has attendance record
    const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } });
    if (!meeting) return NextResponse.json({ error: "Meeting not found" }, { status: 404 });

    const isHost = meeting.hostId === user.id;
    if (!isHost) {
      const attendance = await prisma.attendance.findUnique({
        where: { meetingId_userId: { meetingId, userId: user.id } },
      });
      if (!attendance) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

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

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const meetingId = searchParams.get("meetingId");
  if (!meetingId) return NextResponse.json({ error: "meetingId required" }, { status: 400 });

  // Only host or participants/attendees may fetch transcript
  const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } });
  if (!meeting) return NextResponse.json({ error: "Meeting not found" }, { status: 404 });

  const isHost = meeting.hostId === user.id;
  if (!isHost) {
    const attendance = await prisma.attendance.findUnique({
      where: { meetingId_userId: { meetingId, userId: user.id } },
    });
    const isParticipant = attendance
      ? true
      : !!(await prisma.participant.findUnique({
          where: { meetingId_userId: { meetingId, userId: user.id } },
        }));
    if (!isParticipant) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const transcript = await prisma.transcript.findUnique({ where: { meetingId } });
  return NextResponse.json(transcript ?? { content: "" });
}

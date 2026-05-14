import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const meeting = await prisma.meeting.findUnique({
    where: { id },
    include: {
      host: { select: { name: true, avatarUrl: true } },
      summary: true,
      transcript: true,
      _count: { select: { attendance: true, participants: true } },
    },
  });

  if (!meeting) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Only host, participants, or attendees may view meeting details
  const isHost = meeting.hostId === user.id;
  if (!isHost && !meeting.isPublic) {
    const hasAccess = await prisma.attendance.findUnique({
      where: { meetingId_userId: { meetingId: id, userId: user.id } },
    });
    if (!hasAccess) {
      const isParticipant = await prisma.participant.findUnique({
        where: { meetingId_userId: { meetingId: id, userId: user.id } },
      });
      if (!isParticipant) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }
  }

  return NextResponse.json(meeting);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { id } = await params;

  const existing = await prisma.meeting.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.hostId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { title, description, startTime, maxParticipants, isPublic, isRecorded, status } = body;

  // Validate status transitions
  const validStatuses = ["SCHEDULED", "LIVE", "ENDED", "CANCELLED"];
  if (status !== undefined && !validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  // Validate maxParticipants range
  if (maxParticipants !== undefined && (maxParticipants < 2 || maxParticipants > 1000)) {
    return NextResponse.json({ error: "maxParticipants must be between 2 and 1000" }, { status: 400 });
  }

  // Validate title length
  if (title !== undefined) {
    const trimmed = String(title).trim();
    if (trimmed.length < 3) return NextResponse.json({ error: "title must be at least 3 characters" }, { status: 400 });
    if (trimmed.length > 200) return NextResponse.json({ error: "title must not exceed 200 characters" }, { status: 400 });
  }

  // Validate startTime is in the future (allow 5 min clock drift)
  let parsedStartTime: Date | undefined;
  if (startTime !== undefined) {
    parsedStartTime = new Date(startTime);
    if (isNaN(parsedStartTime.getTime())) {
      return NextResponse.json({ error: "Invalid startTime" }, { status: 400 });
    }
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (parsedStartTime < fiveMinAgo && existing.status === "SCHEDULED") {
      return NextResponse.json({ error: "startTime must be in the future" }, { status: 400 });
    }
  }

  const meeting = await prisma.meeting.update({
    where: { id },
    data: {
      ...(title !== undefined && { title: String(title).trim().slice(0, 200) }),
      ...(description !== undefined && { description: description ? String(description).trim().slice(0, 2000) : null }),
      ...(parsedStartTime !== undefined && { startTime: parsedStartTime }),
      ...(maxParticipants !== undefined && { maxParticipants }),
      ...(isPublic !== undefined && { isPublic: Boolean(isPublic) }),
      ...(isRecorded !== undefined && { isRecorded: Boolean(isRecorded) }),
      ...(status !== undefined && { status }),
    },
  });

  return NextResponse.json(meeting);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { id } = await params;

  const meeting = await prisma.meeting.findUnique({ where: { id } });
  if (!meeting) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (meeting.hostId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.meeting.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

import { getServerUserId } from "@/lib/session";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateRoomId, generateInviteCode } from "@/lib/meeting-utils";

export async function GET() {
  const userId = await getServerUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json([], { status: 200 });

  const meetings = await prisma.meeting.findMany({
    where: { hostId: user.id },
    orderBy: { startTime: "desc" },
    include: {
      _count: { select: { attendance: true } },
      summary: { select: { summary: true } },
    },
  });

  return NextResponse.json(meetings);
}

export async function POST(req: Request) {
  const userId = await getServerUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await req.json();
  const { title, description, startTime, maxParticipants, isPublic, isRecorded } = body;

  if (!title || typeof title !== "string" || title.trim().length < 3) {
    return NextResponse.json({ error: "title must be at least 3 characters" }, { status: 400 });
  }
  if (title.trim().length > 200) {
    return NextResponse.json({ error: "title must not exceed 200 characters" }, { status: 400 });
  }
  if (!startTime) {
    return NextResponse.json({ error: "startTime is required" }, { status: 400 });
  }

  const parsedStart = new Date(startTime);
  if (isNaN(parsedStart.getTime())) {
    return NextResponse.json({ error: "Invalid startTime" }, { status: 400 });
  }

  // Allow scheduling up to 5 minutes in the past (clock drift tolerance)
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
  if (parsedStart < fiveMinAgo) {
    return NextResponse.json({ error: "startTime must be in the future" }, { status: 400 });
  }

  if (maxParticipants !== undefined && maxParticipants !== null) {
    const max = Number(maxParticipants);
    if (!Number.isInteger(max) || max < 2 || max > 1000) {
      return NextResponse.json({ error: "maxParticipants must be an integer between 2 and 1000" }, { status: 400 });
    }
  }

  const meeting = await prisma.meeting.create({
    data: {
      title: title.trim(),
      description: description ? String(description).trim().slice(0, 2000) : null,
      startTime: parsedStart,
      hostId: user.id,
      roomId: generateRoomId(),
      inviteCode: generateInviteCode(),
      maxParticipants: maxParticipants ? Number(maxParticipants) : null,
      isPublic: Boolean(isPublic ?? false),
      isRecorded: Boolean(isRecorded ?? false),
      status: "SCHEDULED",
    },
  });

  return NextResponse.json(meeting, { status: 201 });
}

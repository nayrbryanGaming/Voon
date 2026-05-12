import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateRoomId, generateInviteCode } from "@/lib/meeting-utils";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
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
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await req.json();
  const { title, description, startTime, maxParticipants, isPublic, isRecorded } = body;

  if (!title || !startTime) {
    return NextResponse.json({ error: "title and startTime are required" }, { status: 400 });
  }

  const meeting = await prisma.meeting.create({
    data: {
      title,
      description: description || null,
      startTime: new Date(startTime),
      hostId: user.id,
      roomId: generateRoomId(),
      inviteCode: generateInviteCode(),
      maxParticipants: maxParticipants || null,
      isPublic: isPublic ?? false,
      isRecorded: isRecorded ?? false,
      status: "SCHEDULED",
    },
  });

  return NextResponse.json(meeting, { status: 201 });
}

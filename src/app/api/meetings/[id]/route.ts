import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
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
  return NextResponse.json(meeting);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  const { id } = await params;

  const existing = await prisma.meeting.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.hostId !== user?.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { title, description, startTime, maxParticipants, isPublic, isRecorded, status } = body;

  const meeting = await prisma.meeting.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(startTime !== undefined && { startTime: new Date(startTime) }),
      ...(maxParticipants !== undefined && { maxParticipants }),
      ...(isPublic !== undefined && { isPublic }),
      ...(isRecorded !== undefined && { isRecorded }),
      ...(status !== undefined && { status }),
    },
  });

  return NextResponse.json(meeting);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  const { id } = await params;

  const meeting = await prisma.meeting.findUnique({ where: { id } });
  if (!meeting) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (meeting.hostId !== user?.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.meeting.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

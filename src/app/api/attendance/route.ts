import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const meetingId = searchParams.get("meetingId");

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json([], { status: 200 });

  let where: { meetingId?: string; userId?: string };
  if (meetingId) {
    const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } });
    if (!meeting) return NextResponse.json([], { status: 200 });
    if (meeting.hostId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    where = { meetingId };
  } else {
    where = { userId: user.id };
  }

  const records = await prisma.attendance.findMany({
    where,
    include: {
      user: { select: { name: true, avatarUrl: true, email: true } },
      meeting: { select: { title: true, startTime: true } },
    },
    orderBy: { joinedAt: "desc" },
  });

  return NextResponse.json(records);
}

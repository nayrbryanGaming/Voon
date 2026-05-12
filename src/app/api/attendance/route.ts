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

  const where = meetingId
    ? { meetingId }
    : { userId: user.id };

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

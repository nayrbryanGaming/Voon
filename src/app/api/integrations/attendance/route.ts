/**
 * LMS Integration: Attendance pull endpoint
 * Allows campus LMS to pull attendance data for a specific meeting.
 *
 * GET /api/integrations/attendance?meetingId=xxx
 * Returns: list of attendance records with student email, name, duration, status
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function verifyToken(req: Request): boolean {
  const secret = process.env.INTEGRATION_SECRET;
  if (!secret) return false;
  const auth = req.headers.get("authorization") ?? "";
  return auth === `Bearer ${secret}`;
}

export async function GET(req: Request) {
  if (!verifyToken(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const meetingId = searchParams.get("meetingId");
    const inviteCode = searchParams.get("inviteCode");

    if (!meetingId && !inviteCode) {
      return NextResponse.json(
        { error: "meetingId or inviteCode query param required" },
        { status: 400 }
      );
    }

    const meeting = meetingId
      ? await prisma.meeting.findUnique({ where: { id: meetingId } })
      : await prisma.meeting.findUnique({ where: { inviteCode: inviteCode! } });

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    const attendance = await prisma.attendance.findMany({
      where: { meetingId: meeting.id },
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { joinedAt: "asc" },
    });

    return NextResponse.json({
      meeting: {
        id: meeting.id,
        title: meeting.title,
        startTime: meeting.startTime,
        endTime: meeting.endTime,
        duration: meeting.duration,
        status: meeting.status,
      },
      attendance: attendance.map((a) => ({
        studentName: a.user.name,
        studentEmail: a.user.email,
        joinedAt: a.joinedAt,
        leftAt: a.leftAt,
        durationSeconds: a.duration,
        status: a.status,
      })),
      summary: {
        total: attendance.length,
        present: attendance.filter((a) => a.status === "PRESENT").length,
        late: attendance.filter((a) => a.status === "LATE").length,
        absent: attendance.filter((a) => a.status === "ABSENT").length,
      },
    });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

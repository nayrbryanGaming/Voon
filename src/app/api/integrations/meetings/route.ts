/**
 * LMS Integration: Meeting management endpoint
 * Allows campus LMS (Moodle, SIAKAD) to create meetings and pull attendance.
 *
 * Authentication: Bearer token via INTEGRATION_SECRET env var.
 * Usage: Set INTEGRATION_SECRET in Vercel env vars, then configure your LMS
 *        to call this endpoint.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";

function verifyToken(req: Request): boolean {
  const secret = process.env.INTEGRATION_SECRET;
  if (!secret) return false; // integration disabled when secret not set
  const auth = req.headers.get("authorization") ?? "";
  return auth === `Bearer ${secret}`;
}

/**
 * POST /api/integrations/meetings
 * Create a meeting from LMS. Body: { title, hostEmail, startTime, description?, isRecorded? }
 * Returns: { id, roomId, inviteCode, joinUrl }
 */
export async function POST(req: Request) {
  if (!verifyToken(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, hostEmail, startTime, description, isRecorded } = body as {
      title: string;
      hostEmail: string;
      startTime: string;
      description?: string;
      isRecorded?: boolean;
    };

    if (!title || !hostEmail || !startTime) {
      return NextResponse.json(
        { error: "title, hostEmail, and startTime are required" },
        { status: 400 }
      );
    }

    const host = await prisma.user.findUnique({ where: { email: hostEmail } });
    if (!host) {
      return NextResponse.json({ error: "Host user not found" }, { status: 404 });
    }

    const meeting = await prisma.meeting.create({
      data: {
        title,
        description: description ?? null,
        hostId: host.id,
        startTime: new Date(startTime),
        isRecorded: isRecorded ?? false,
        roomId: nanoid(12),
        inviteCode: nanoid(8),
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://voon.vercel.app";

    return NextResponse.json({
      id: meeting.id,
      roomId: meeting.roomId,
      inviteCode: meeting.inviteCode,
      joinUrl: `${appUrl}/join?code=${meeting.inviteCode}`,
      lobbyUrl: `${appUrl}/meetings/${meeting.id}`,
    });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

/**
 * GET /api/integrations/meetings?hostEmail=x@y.z&status=ENDED
 * List meetings. Query: hostEmail (required), status (optional)
 */
export async function GET(req: Request) {
  if (!verifyToken(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const hostEmail = searchParams.get("hostEmail");
    const status = searchParams.get("status");

    if (!hostEmail) {
      return NextResponse.json({ error: "hostEmail query param required" }, { status: 400 });
    }

    const host = await prisma.user.findUnique({ where: { email: hostEmail } });
    if (!host) {
      return NextResponse.json({ error: "Host not found" }, { status: 404 });
    }

    const meetings = await prisma.meeting.findMany({
      where: {
        hostId: host.id,
        ...(status ? { status: status as "SCHEDULED" | "LIVE" | "ENDED" | "CANCELLED" } : {}),
      },
      select: {
        id: true,
        title: true,
        roomId: true,
        inviteCode: true,
        startTime: true,
        endTime: true,
        status: true,
        duration: true,
        _count: { select: { attendance: true } },
      },
      orderBy: { startTime: "desc" },
      take: 50,
    });

    return NextResponse.json(meetings);
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

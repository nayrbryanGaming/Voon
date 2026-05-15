import { getServerUserId } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";
import { generateToken } from "@/lib/livekit";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, sanitizeString, withSecureHeaders } from "@/lib/api-security";

export const maxDuration = 10;
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // Rate-limit: 30 token requests per IP per hour (prevents room-flooding)
  const limited = checkRateLimit(req, 30);
  if (limited) return limited;

  if (!process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET || !process.env.NEXT_PUBLIC_LIVEKIT_URL) {
    return withSecureHeaders(NextResponse.json(
      { error: "LiveKit belum dikonfigurasi. Set LIVEKIT_API_KEY, LIVEKIT_API_SECRET, dan NEXT_PUBLIC_LIVEKIT_URL." },
      { status: 503 }
    ));
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return withSecureHeaders(NextResponse.json({ error: "Invalid JSON" }, { status: 400 }));
  }

  const { roomName, isHost, guestName } = body as { roomName?: unknown; isHost?: unknown; guestName?: unknown };

  if (!roomName || typeof roomName !== "string" || roomName.trim().length < 1) {
    return withSecureHeaders(NextResponse.json({ error: "roomName required" }, { status: 400 }));
  }
  const safeRoom = sanitizeString(String(roomName), 256);

  const userId = await getServerUserId();

  // Guest path — unauthenticated users joining via invite link
  if (!userId) {
    if (!guestName || typeof guestName !== "string" || sanitizeString(String(guestName), 64).length < 1) {
      return withSecureHeaders(NextResponse.json({ error: "guestName required for guests" }, { status: 400 }));
    }
    const safeGuestName = sanitizeString(String(guestName), 64);
    const guestId = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const token = await generateToken({
      roomName: safeRoom,
      participantName: safeGuestName,
      participantId: guestId,
      isHost: false,
    });
    return withSecureHeaders(
      NextResponse.json({ token, serverUrl: process.env.NEXT_PUBLIC_LIVEKIT_URL })
    );
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return withSecureHeaders(NextResponse.json({ error: "User not found" }, { status: 404 }));
  }

  // Verify the room belongs to a meeting hosted by this user (or is public/guest joinable)
  const meeting = await prisma.meeting.findUnique({ where: { roomId: safeRoom } });
  const resolvedIsHost = meeting ? meeting.hostId === userId : Boolean(isHost);

  const token = await generateToken({
    roomName: safeRoom,
    participantName: user.name,
    participantId: user.id,
    isHost: resolvedIsHost,
  });

  return withSecureHeaders(
    NextResponse.json({ token, serverUrl: process.env.NEXT_PUBLIC_LIVEKIT_URL })
  );
}

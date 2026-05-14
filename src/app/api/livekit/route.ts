import { getServerUserId } from "@/lib/session";
import { NextResponse } from "next/server";
import { generateToken } from "@/lib/livekit";
import { prisma } from "@/lib/prisma";

export const maxDuration = 10;

export async function POST(req: Request) {
  const { roomName, isHost, guestName } = await req.json();
  if (!roomName) return NextResponse.json({ error: "roomName required" }, { status: 400 });

  const userId = await getServerUserId();

  // Allow guests (no session) — they provide a guestName
  if (!userId) {
    if (!guestName || typeof guestName !== "string" || guestName.trim().length < 1) {
      return NextResponse.json({ error: "guestName required for guests" }, { status: 400 });
    }
    const guestId = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const token = await generateToken({
      roomName,
      participantName: guestName.trim(),
      participantId: guestId,
      isHost: false,
    });
    return NextResponse.json({ token, serverUrl: process.env.NEXT_PUBLIC_LIVEKIT_URL });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const token = await generateToken({
    roomName,
    participantName: user.name,
    participantId: user.id,
    isHost: isHost ?? false,
  });

  return NextResponse.json({ token, serverUrl: process.env.NEXT_PUBLIC_LIVEKIT_URL });
}

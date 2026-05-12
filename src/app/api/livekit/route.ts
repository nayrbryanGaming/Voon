import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { generateToken } from "@/lib/livekit";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { roomName, isHost } = await req.json();
  if (!roomName) return NextResponse.json({ error: "roomName required" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const token = await generateToken({
    roomName,
    participantName: user.name,
    participantId: user.id,
    isHost: isHost ?? false,
  });

  return NextResponse.json({ token, serverUrl: process.env.NEXT_PUBLIC_LIVEKIT_URL });
}

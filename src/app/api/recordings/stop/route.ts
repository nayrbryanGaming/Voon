import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { EgressClient } from "livekit-server-sdk";
import { prisma } from "@/lib/prisma";

export const maxDuration = 30;

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { roomName, meetingId, egressId } = await req.json();
  if (!roomName || typeof roomName !== "string") {
    return NextResponse.json({ error: "roomName required" }, { status: 400 });
  }

  // Only host may stop recording
  if (meetingId) {
    const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } });
    if (meeting && meeting.hostId !== user.id) {
      return NextResponse.json({ error: "Forbidden — only host can stop recording" }, { status: 403 });
    }
  }

  const livekitUrl = process.env.LIVEKIT_URL;
  const livekitKey = process.env.LIVEKIT_API_KEY;
  const livekitSecret = process.env.LIVEKIT_API_SECRET;
  if (!livekitUrl || !livekitKey || !livekitSecret) {
    return NextResponse.json({ error: "Recording not configured" }, { status: 503 });
  }

  try {
    const egressClient = new EgressClient(livekitUrl, livekitKey, livekitSecret);

    if (egressId) {
      await egressClient.stopEgress(egressId);
    } else {
      const egresses = await egressClient.listEgress({ roomName });
      for (const e of egresses) {
        await egressClient.stopEgress(e.egressId);
      }
    }

    if (meetingId) {
      await prisma.meeting.update({
        where: { id: meetingId },
        data: { isRecorded: true },
      }).catch(() => {});
    }

    return NextResponse.json({ status: "stopped" });
  } catch (err) {
    console.error("Recording stop error:", err);
    return NextResponse.json({ error: "Failed to stop recording" }, { status: 500 });
  }
}

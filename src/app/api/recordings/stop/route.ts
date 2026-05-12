import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { EgressClient } from "livekit-server-sdk";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { roomName, meetingId, egressId } = await req.json();
  if (!roomName) {
    return NextResponse.json({ error: "roomName required" }, { status: 400 });
  }

  try {
    const egressClient = new EgressClient(
      process.env.LIVEKIT_URL ?? "",
      process.env.LIVEKIT_API_KEY ?? "",
      process.env.LIVEKIT_API_SECRET ?? ""
    );

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
